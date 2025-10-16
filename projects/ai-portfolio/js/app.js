/**
 * App.js
 * Main application logic for portfolio website
 * Handles navigation, smooth scrolling, and interactive features
 */

(function() {
    'use strict';

    /**
     * Smooth Scroll Navigation
     */
    class SmoothScroll {
        constructor() {
            this.init();
        }

        init() {
            // Handle all navigation links
            const navLinks = document.querySelectorAll('a[href^="#"]');

            navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const href = link.getAttribute('href');

                    // Skip empty hash links
                    if (href === '#') return;

                    e.preventDefault();

                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                        this.scrollToElement(targetElement);
                    }
                });
            });
        }

        scrollToElement(element) {
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });

            // Update URL hash without jumping
            if (element.id) {
                history.pushState(null, null, `#${element.id}`);
            }
        }
    }

    /**
     * Sticky Navigation with Active State
     */
    class StickyNav {
        constructor() {
            this.navbar = document.querySelector('.navbar');
            this.navLinks = document.querySelectorAll('.nav-link');
            this.sections = document.querySelectorAll('section[id]');
            this.init();
        }

        init() {
            // Update active link on scroll
            let ticking = false;

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        this.updateActiveLink();
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            // Initial check
            this.updateActiveLink();
        }

        updateActiveLink() {
            const scrollPosition = window.pageYOffset + 100;

            this.sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === `#${sectionId}`) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }
    }

    /**
     * Syntax Highlighting for Code Blocks
     */
    function initSyntaxHighlighting() {
        if (typeof hljs !== 'undefined') {
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
            console.log('✨ Syntax highlighting initialized');
        }
    }

    /**
     * Mobile Menu Toggle
     */
    class MobileMenu {
        constructor() {
            this.menuButton = document.querySelector('.mobile-menu-button');
            this.menu = document.querySelector('.nav-menu');
            this.init();
        }

        init() {
            if (!this.menuButton) return;

            this.menuButton.addEventListener('click', () => {
                this.toggle();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.menuButton.contains(e.target) && !this.menu.contains(e.target)) {
                    this.close();
                }
            });

            // Close menu when clicking on a link
            const menuLinks = this.menu.querySelectorAll('a');
            menuLinks.forEach(link => {
                link.addEventListener('click', () => {
                    this.close();
                });
            });
        }

        toggle() {
            this.menu.classList.toggle('active');
            this.menuButton.classList.toggle('active');
        }

        close() {
            this.menu.classList.remove('active');
            this.menuButton.classList.remove('active');
        }
    }

    /**
     * Back to Top Button
     */
    class BackToTop {
        constructor() {
            this.createButton();
            this.init();
        }

        createButton() {
            this.button = document.createElement('button');
            this.button.className = 'back-to-top';
            this.button.innerHTML = '↑';
            this.button.setAttribute('aria-label', 'Back to top');
            document.body.appendChild(this.button);

            // Add styles
            const style = document.createElement('style');
            style.textContent = `
                .back-to-top {
                    position: fixed;
                    bottom: 2rem;
                    right: 2rem;
                    width: 50px;
                    height: 50px;
                    background: linear-gradient(135deg, #6B46C1 0%, #3B82F6 100%);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    font-size: 1.5rem;
                    cursor: pointer;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 999;
                }

                .back-to-top.visible {
                    opacity: 1;
                    visibility: visible;
                }

                .back-to-top:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
                }

                @media (max-width: 768px) {
                    .back-to-top {
                        bottom: 1rem;
                        right: 1rem;
                        width: 45px;
                        height: 45px;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        init() {
            let ticking = false;

            // Show/hide button on scroll
            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(() => {
                        if (window.pageYOffset > 300) {
                            this.button.classList.add('visible');
                        } else {
                            this.button.classList.remove('visible');
                        }
                        ticking = false;
                    });
                    ticking = true;
                }
            });

            // Scroll to top on click
            this.button.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    /**
     * Copy Code Button for Code Blocks
     */
    function initCopyCodeButtons() {
        const codeBlocks = document.querySelectorAll('pre code');

        codeBlocks.forEach(codeBlock => {
            const pre = codeBlock.parentElement;
            const wrapper = document.createElement('div');
            wrapper.style.position = 'relative';

            const button = document.createElement('button');
            button.className = 'copy-code-button';
            button.textContent = 'Copy';
            button.style.cssText = `
                position: absolute;
                top: 0.5rem;
                right: 0.5rem;
                padding: 0.5rem 1rem;
                background: rgba(255, 255, 255, 0.9);
                border: none;
                border-radius: 0.375rem;
                font-size: 0.75rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
                z-index: 10;
            `;

            button.addEventListener('click', async () => {
                const code = codeBlock.textContent;

                try {
                    await navigator.clipboard.writeText(code);
                    button.textContent = 'Copied!';
                    button.style.background = '#10B981';
                    button.style.color = 'white';

                    setTimeout(() => {
                        button.textContent = 'Copy';
                        button.style.background = 'rgba(255, 255, 255, 0.9)';
                        button.style.color = 'inherit';
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy code:', err);
                    button.textContent = 'Failed';
                    setTimeout(() => {
                        button.textContent = 'Copy';
                    }, 2000);
                }
            });

            pre.parentNode.insertBefore(wrapper, pre);
            wrapper.appendChild(pre);
            wrapper.appendChild(button);
        });
    }

    /**
     * Lazy Load Images
     */
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    /**
     * External Link Handler
     * Add target="_blank" and rel="noopener noreferrer" to external links
     */
    function initExternalLinks() {
        const links = document.querySelectorAll('a[href^="http"]');

        links.forEach(link => {
            const href = link.getAttribute('href');

            // Check if link is external
            if (href && !href.includes(window.location.hostname)) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    }

    /**
     * Keyboard Navigation
     */
    function initKeyboardNav() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes mobile menu if open
            if (e.key === 'Escape') {
                const menu = document.querySelector('.nav-menu.active');
                if (menu) {
                    menu.classList.remove('active');
                }
            }
        });
    }

    /**
     * Performance Optimization: Debounce Function
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Add Loading State
     */
    function removeLoadingState() {
        document.body.classList.add('loaded');

        // Add loaded class style
        const style = document.createElement('style');
        style.textContent = `
            body {
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            body.loaded {
                opacity: 1;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Print-Friendly Version
     */
    function initPrintStyles() {
        window.addEventListener('beforeprint', () => {
            // Expand all collapsed sections for printing
            document.querySelectorAll('details').forEach(detail => {
                detail.setAttribute('open', '');
            });
        });
    }

    /**
     * Analytics Event Tracking (placeholder)
     */
    function trackEvent(category, action, label) {
        // Placeholder for analytics tracking
        // Example: Google Analytics, Plausible, etc.
        console.log(`Event: ${category} - ${action} - ${label}`);

        // Example for Google Analytics
        // if (typeof gtag !== 'undefined') {
        //     gtag('event', action, {
        //         event_category: category,
        //         event_label: label
        //     });
        // }
    }

    /**
     * Track Important Interactions
     */
    function initEventTracking() {
        // Track CTA button clicks
        document.querySelectorAll('.btn-primary, .btn-secondary').forEach(button => {
            button.addEventListener('click', () => {
                trackEvent('Button', 'Click', button.textContent);
            });
        });

        // Track social link clicks
        document.querySelectorAll('.contact-link').forEach(link => {
            link.addEventListener('click', () => {
                trackEvent('Social', 'Click', link.textContent);
            });
        });

        // Track section views
        const sections = document.querySelectorAll('section[id]');
        const sectionObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    trackEvent('Section', 'View', entry.target.id);
                }
            });
        }, { threshold: 0.5 });

        sections.forEach(section => sectionObserver.observe(section));
    }

    /**
     * Initialize Application
     */
    function init() {
        console.log('🚀 Initializing portfolio application...');

        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Initialize all features
        new SmoothScroll();
        new StickyNav();
        new MobileMenu();
        new BackToTop();

        initSyntaxHighlighting();
        initCopyCodeButtons();
        initLazyLoading();
        initExternalLinks();
        initKeyboardNav();
        initPrintStyles();
        initEventTracking();

        // Remove loading state
        removeLoadingState();

        console.log('✅ Portfolio application ready');
    }

    // Initialize
    init();

    // Export utilities for external use
    window.PortfolioApp = {
        SmoothScroll,
        StickyNav,
        trackEvent,
        debounce
    };

})();
