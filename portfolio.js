// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', function () {

    // Smooth scrolling navigation
    const navLinks = document.querySelectorAll('.nav-btn, .toc-item');

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Active Link Highlighting
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', function () {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.clientHeight;
            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        // Optional: specific logic for highlighting nav buttons if needed
    });

    // --- GSAP Animations ---

    // 1. Fade Up Titles
    gsap.utils.toArray('.page-title').forEach(title => {
        gsap.from(title, {
            scrollTrigger: {
                trigger: title,
                start: "top 95%", // Trigger almost immediately when in view
                toggleActions: "play none none none"
            },
            y: 30,
            opacity: 0,
            duration: 1,
            ease: "power2.out",
            onComplete: () => {
                gsap.set(title, { clearProps: "all" }); // Remove GSAP inline styles after animation to prevent issues
                title.style.opacity = "1"; // Force visibility
                title.style.transform = "none";
            }
        });
    });

    // 2. Animate Section Content (Staggered Children)
    gsap.utils.toArray('.page-content').forEach((sectionContent, i) => {
        // Skip cover page content animation to let the CSS letter animation take focus
        if (sectionContent.closest('.cover-page')) return;

        const elementsToAnimate = sectionContent.querySelectorAll('p, h3, .skills-list, .experience-item, .testimonial, .contact-item');

        if (elementsToAnimate.length > 0) {
            gsap.from(elementsToAnimate, {
                scrollTrigger: {
                    trigger: sectionContent,
                    start: "top 85%", // Slightly earlier
                    toggleActions: "play none none none"
                },
                y: 30,
                opacity: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: "power2.out"
            });
        }
    });

    // 3. Staggered Image Entry (Refined)
    gsap.utils.toArray('.image-grid, .image-horizontal, .about-photo, .contact-photo').forEach(container => {
        let elements = container.querySelectorAll('.phone-frame');
        if (elements.length === 0) {
            elements = container.querySelectorAll('img');
        }

        if (elements.length > 0) {
            gsap.from(elements, {
                scrollTrigger: {
                    trigger: container,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                },
                scale: 0.95, // Subtle scale
                opacity: 0,
                y: 30,
                duration: 1.2,
                stagger: 0.1,
                ease: "power2.out" // Smoother, less bouncy
            });
        }
    });

    // --- 4. Interactive 3D Tilt for Phone Frames ---
    // Only apply on non-touch devices for performance/UX
    if (window.matchMedia("(hover: hover)").matches) {
        document.querySelectorAll('.phone-frame').forEach(frame => {
            frame.addEventListener('mousemove', (e) => {
                const rect = frame.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Calculate rotation based on cursor position
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Max rotation degrees
                const maxRotate = 10;

                const rotateX = ((y - centerY) / centerY) * -maxRotate;
                const rotateY = ((x - centerX) / centerX) * maxRotate;

                gsap.to(frame, {
                    duration: 0.5,
                    rotateX: rotateX,
                    rotateY: rotateY,
                    transformPerspective: 1000,
                    scale: 1.02,
                    ease: "power2.out",
                    overwrite: true
                });
            });

            frame.addEventListener('mouseleave', () => {
                gsap.to(frame, {
                    duration: 0.8,
                    rotateX: 0,
                    rotateY: 0,
                    scale: 1,
                    ease: "elastic.out(1, 0.5)",
                    overwrite: true
                });
            });
        });
    }

    // --- Existing CSS Animation Control ---
    // Keep continuous animations (float/pulse) running only when visible
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            } else {
                entry.target.style.animationPlayState = 'paused';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.animate-image, .animate-card').forEach(el => {
        observer.observe(el);
        // --- 5. Hero Slider Logic ---
        const sliderWrapper = document.querySelector('.slides-wrapper');
        const dots = document.querySelectorAll('.dot');
        const arrow = document.querySelector('.slider-arrow');
        const slideCount = dots.length;
        let currentSlide = 0;

        function updateSlider() {
            // Move slider wrapper
            const percentage = currentSlide * -50; // -0% or -50% for 2 slides active width
            sliderWrapper.style.transform = `translateX(${percentage}%)`;

            // Update dots
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });

            // Optional: Rotate arrow or change style if at end
            if (currentSlide === 1) {
                arrow.style.transform = 'translateY(-50%) rotate(180deg)';
            } else {
                arrow.style.transform = 'translateY(-50%) rotate(0deg)';
            }
        }

        // Arrow Click
        if (arrow) {
            arrow.addEventListener('click', () => {
                currentSlide = (currentSlide + 1) % slideCount;
                updateSlider();
            });
        }

        // Dot Click
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlider();
            });
        });

        // Swipe Gestures
        let touchStartX = 0;
        let touchEndX = 0;
        const sliderContainer = document.querySelector('.slider-container');

        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            sliderContainer.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });
        }

        function handleSwipe() {
            const threshold = 50;
            if (touchStartX - touchEndX > threshold) {
                // Swiped Left -> Next Slide
                if (currentSlide < slideCount - 1) {
                    currentSlide++;
                    updateSlider();
                }
            }
            if (touchEndX - touchStartX > threshold) {
                // Swiped Right -> Prev Slide
                if (currentSlide > 0) {
                    currentSlide--;
                    updateSlider();
                }
            }
        }

        // --- 6. 3D Tilt Effect for Project Gallery ---
        const tiltCards = document.querySelectorAll('.phone-frame');

        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Calculate rotation based on cursor position
                // Max rotation: +/- 15 degrees
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -15; // Invert Y for natural tilt
                const rotateY = ((x - centerX) / centerX) * 15;

                // Apply transform
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
            });

            card.addEventListener('mouseleave', () => {
                // Reset position smoothly
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });
        });

    });

    // --- 7. Experience Timeline Animation (Draw line + Pop cards) ---
    // Animate the line drawing
    gsap.from('.experience-content::before', {
        scrollTrigger: {
            trigger: '.experience-content',
            start: "top 80%",
            end: "bottom 80%",
            scrub: 1, // Draw line as you scroll
        },
        height: 0,
        ease: "none"
    });

    // Animate Cards entering
    gsap.utils.toArray('.experience-item').forEach((item, i) => {
        // Set initial state
        gsap.set(item, { opacity: 0, x: -50 });

        // Animate to visible
        gsap.to(item, {
            scrollTrigger: {
                trigger: item,
                start: "top 85%",
                toggleActions: "play none none none"
            },
            opacity: 1,
            x: 0,
            duration: 0.8,
            ease: "back.out(1.7)",
            delay: i * 0.1
        });
    });

});