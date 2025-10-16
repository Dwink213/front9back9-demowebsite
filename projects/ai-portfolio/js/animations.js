/**
 * Animations.js
 * Handles animated metric counters and scroll-triggered animations
 */

(function() {
    'use strict';

    /**
     * Animated Counter
     * Animates numbers from 0 to target value
     */
    class Counter {
        constructor(element, target, duration = 2000) {
            this.element = element;
            this.target = parseInt(target);
            this.duration = duration;
            this.current = 0;
            this.increment = this.target / (this.duration / 16); // 60 FPS
            this.hasAnimated = false;
        }

        animate() {
            if (this.hasAnimated) return;
            this.hasAnimated = true;

            const updateCounter = () => {
                this.current += this.increment;

                if (this.current < this.target) {
                    this.element.textContent = Math.floor(this.current);
                    requestAnimationFrame(updateCounter);
                } else {
                    this.element.textContent = this.target;
                }
            };

            requestAnimationFrame(updateCounter);
        }

        reset() {
            this.current = 0;
            this.hasAnimated = false;
            this.element.textContent = '0';
        }
    }

    /**
     * Intersection Observer for scroll-triggered animations
     */
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
    };

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');

                // Trigger counter animation for metric cards
                if (entry.target.classList.contains('metric-card')) {
                    animateMetricCard(entry.target);
                }
            }
        });
    }, observerOptions);

    /**
     * Animate individual metric card
     */
    function animateMetricCard(card) {
        const valueElement = card.querySelector('.metric-value [data-target], .metric-value[data-target]');

        if (valueElement && valueElement.hasAttribute('data-target')) {
            const target = valueElement.getAttribute('data-target');
            const counter = new Counter(valueElement, target, 2000);

            // Add animation class
            card.classList.add('animating');

            // Start counter animation
            setTimeout(() => {
                counter.animate();
            }, 100);

            // Remove animation class after completion
            setTimeout(() => {
                card.classList.remove('animating');
            }, 2500);
        }
    }

    /**
     * Initialize all metric counters
     */
    function initMetricCounters() {
        const metricCards = document.querySelectorAll('.metric-card');

        metricCards.forEach(card => {
            // Add to intersection observer
            animationObserver.observe(card);
        });
    }

    /**
     * Reveal elements on scroll
     */
    function initScrollReveal() {
        const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    revealObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    /**
     * Animate code blocks on scroll
     */
    function initCodeBlockAnimations() {
        const codeBlocks = document.querySelectorAll('.code-block');

        const codeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    codeObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        codeBlocks.forEach(block => {
            codeObserver.observe(block);
        });
    }

    /**
     * Animate sections on scroll
     */
    function initSectionAnimations() {
        const sections = document.querySelectorAll('section');

        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px'
        });

        sections.forEach(section => {
            sectionObserver.observe(section);
        });
    }

    /**
     * Staggered animation for multiple elements
     */
    function initStaggeredAnimations() {
        const staggerGroups = document.querySelectorAll('[data-stagger]');

        staggerGroups.forEach(group => {
            const children = group.children;
            const delay = parseInt(group.getAttribute('data-stagger-delay')) || 100;

            Array.from(children).forEach((child, index) => {
                child.style.animationDelay = `${index * delay}ms`;
                child.classList.add('fade-in-up');
            });
        });
    }

    /**
     * Parallax effect on scroll
     */
    function initParallax() {
        const parallaxElements = document.querySelectorAll('.parallax-slow');

        if (parallaxElements.length === 0) return;

        let ticking = false;

        function updateParallax() {
            const scrolled = window.pageYOffset;

            parallaxElements.forEach(element => {
                const speed = element.getAttribute('data-speed') || 0.5;
                const yPos = -(scrolled * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });

            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateParallax);
                ticking = true;
            }
        });
    }

    /**
     * Progress bar animation
     */
    function animateProgressBars() {
        const progressBars = document.querySelectorAll('.progress-fill');

        const progressObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const fill = entry.target;
                    const targetWidth = fill.getAttribute('data-width') || '0%';
                    fill.style.width = targetWidth;
                    progressObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        progressBars.forEach(bar => {
            progressObserver.observe(bar);
        });
    }

    /**
     * Add entrance animations to elements
     */
    function addEntranceAnimations() {
        // Hero section elements
        const heroElements = document.querySelectorAll('.hero-title, .hero-subtitle, .hero-description, .hero-cta');
        heroElements.forEach((element, index) => {
            element.style.opacity = '0';
            setTimeout(() => {
                element.classList.add('fade-in-up');
            }, index * 200);
        });

        // Process phase elements
        const processPhases = document.querySelectorAll('.process-phase');
        processPhases.forEach((phase, index) => {
            phase.style.opacity = '0';
            const phaseObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.classList.add('fade-in-up');
                        }, index * 150);
                        phaseObserver.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            phaseObserver.observe(phase);
        });

        // Technique cards
        const techniqueCards = document.querySelectorAll('.technique-card');
        techniqueCards.forEach((card, index) => {
            card.style.opacity = '0';
            const cardObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            entry.target.style.opacity = '1';
                            entry.target.classList.add('scale-in');
                        }, index * 150);
                        cardObserver.unobserve(entry.target);
                    }
                });
            }, observerOptions);
            cardObserver.observe(card);
        });
    }

    /**
     * Animate chat messages sequentially
     */
    function initChatAnimations() {
        const chatWindows = document.querySelectorAll('.chat-window');

        const chatObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const messages = entry.target.querySelectorAll('.chat-message');
                    messages.forEach((message, index) => {
                        message.style.animationDelay = `${index * 0.2}s`;
                    });
                    chatObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);

        chatWindows.forEach(window => {
            chatObserver.observe(window);
        });
    }

    /**
     * Scroll progress indicator
     */
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);

        let ticking = false;

        function updateScrollProgress() {
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (window.pageYOffset / windowHeight) * 100;
            progressBar.style.width = `${scrolled}%`;
            ticking = false;
        }

        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(updateScrollProgress);
                ticking = true;
            }
        });
    }

    /**
     * Initialize all animations
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize all animation systems
        initMetricCounters();
        initScrollReveal();
        initCodeBlockAnimations();
        initSectionAnimations();
        initStaggeredAnimations();
        initParallax();
        animateProgressBars();
        addEntranceAnimations();
        initChatAnimations();
        initScrollProgress();

        console.log('✨ Animations initialized');
    }

    // Initialize
    init();

    // Export for external use if needed
    window.AnimationController = {
        Counter,
        init
    };

})();
