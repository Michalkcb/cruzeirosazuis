/**
 * Modern Navigation Script for Cruzeiros Azuis
 * Handles mobile menu toggle and dropdown interactions
 */

(function() {
    'use strict';

    // Mobile menu toggle
    const initMobileMenu = () => {
        const toggle = document.getElementById('mobileMenuToggle');
        const menu = document.getElementById('navMenu');
        
        if (!toggle || !menu) return;

        // Toggle menu on button click
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('active');
            
            // Change icon based on state
            toggle.textContent = menu.classList.contains('active') ? '✕' : '☰';
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && !toggle.contains(e.target)) {
                menu.classList.remove('active');
                toggle.textContent = '☰';
            }
        });

        // Handle dropdown in mobile
        const dropdowns = document.querySelectorAll('.nav-dropdown');
        dropdowns.forEach(dropdown => {
            const link = dropdown.querySelector('a');
            if (window.innerWidth <= 768) {
                link.addEventListener('click', (e) => {
                    // Only prevent default on mobile when clicking parent dropdown
                    if (e.target === link) {
                        e.preventDefault();
                        dropdown.classList.toggle('active');
                    }
                });
            }
        });
    };

    // Smooth scroll for anchor links
    const initSmoothScroll = () => {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    };

    // Add scroll effect to header
    const initScrollEffect = () => {
        const header = document.querySelector('.site-header');
        if (!header) return;

        let lastScroll = 0;
        window.addEventListener('scroll', () => {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
            
            lastScroll = currentScroll;
        });
    };

    // Initialize all features when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initMobileMenu();
            initSmoothScroll();
            initScrollEffect();
        });
    } else {
        initMobileMenu();
        initSmoothScroll();
        initScrollEffect();
    }

})();
