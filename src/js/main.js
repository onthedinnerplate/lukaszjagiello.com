/**
 * Łukasz Jagiełło Photography - Main JavaScript
 * Handles navigation, mobile menu, smooth scrolling, and accessibility
 */

// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const isExpanded = navLinks.classList.contains('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Close menu when a link is clicked
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!menuToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Active Navigation Link
function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '/' && href === '/')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

updateActiveNavLink();

// Smooth Scrolling for Anchor Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for Lazy Loading Images
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
            }
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px'
});

// Observe all lazy images
document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imageObserver.observe(img);
});

// Form Handling (Contact Form)
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);

        // Validate form
        if (!data.name || !data.email || !data.message) {
            showMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Validate email
        if (!isValidEmail(data.email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        // In a real application, this would send to a server
        // For now, we'll simulate the submission
        handleFormSubmission(data);
    });
}

// Email Validation
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Form Submission Handler
function handleFormSubmission(data) {
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    // Simulate network delay
    setTimeout(() => {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        // Show success message
        showMessage('Thank you for your message! I will get back to you soon.', 'success');

        // Reset form
        contactForm.reset();

        // In a real application, send data to server here
        console.log('Form submitted:', data);
    }, 1500);
}

// Show Message (Toast Notification)
function showMessage(message, type = 'info') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `notification notification-${type}`;
    messageDiv.setAttribute('role', 'status');
    messageDiv.setAttribute('aria-live', 'polite');
    messageDiv.textContent = message;

    // Add styles if not already in CSS
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            font-weight: 500;
            max-width: 400px;
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        }

        .notification-success {
            background-color: #39FF14;
            color: #3A3A3A;
        }

        .notification-error {
            background-color: #FF6B6B;
            color: #FFFFFF;
        }

        .notification-info {
            background-color: #4A90E2;
            color: #FFFFFF;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;

    if (!document.querySelector('style[data-notification-styles]')) {
        style.setAttribute('data-notification-styles', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(messageDiv);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            messageDiv.remove();
        }, 300);
    }, 4000);
}

// Scroll To Top Button
function createScrollToTopButton() {
    const button = document.createElement('button');
    button.textContent = '↑';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Scroll to top');

    const style = document.createElement('style');
    style.textContent = `
        .scroll-to-top {
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: #39FF14;
            color: #3A3A3A;
            border: none;
            font-size: 24px;
            cursor: pointer;
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 999;
            transition: all 0.3s ease-out;
            font-weight: 700;
        }

        .scroll-to-top.show {
            display: flex;
        }

        .scroll-to-top:hover {
            background-color: #2fd910;
            transform: translateY(-2px);
        }

        @media (max-width: 768px) {
            .scroll-to-top {
                width: 45px;
                height: 45px;
                bottom: 20px;
                right: 20px;
                font-size: 20px;
            }
        }
    `;

    if (!document.querySelector('style[data-scroll-styles]')) {
        style.setAttribute('data-scroll-styles', 'true');
        document.head.appendChild(style);
    }

    document.body.appendChild(button);

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.classList.add('show');
        } else {
            button.classList.remove('show');
        }
    });

    // Scroll to top on click
    button.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

createScrollToTopButton();

// Keyboard Navigation Enhancement
document.addEventListener('keydown', (e) => {
    // Press '/' to focus search or navigate
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) {
        // Can be expanded for future search functionality
    }
});

// Performance: Optimize Image Loading
function optimizeImageLoading() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        // Add decoding attribute for performance
        img.setAttribute('decoding', 'async');

        // Use requestIdleCallback for non-critical image attributes
        if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
                // Any additional optimizations
            });
        }
    });
}

optimizeImageLoading();

// Analytics Event Tracking (Basic)
function trackEvent(category, action, label) {
    // This can be connected to Google Analytics or other services
    if (window.gtag) {
        gtag('event', action, {
            'event_category': category,
            'event_label': label
        });
    }

    // For development, log to console
    console.log('Event tracked:', { category, action, label });
}

// Track CTA clicks
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', () => {
        const text = button.textContent;
        trackEvent('engagement', 'cta_click', text);
    });
});

// Track navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        trackEvent('navigation', 'nav_link_click', href);
    });
});

// Accessibility: Announce page changes for screen readers
function announcePageChange(title) {
    const announcement = document.createElement('div');
    announcement.className = 'sr-only';
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.textContent = `Navigated to ${title}`;

    document.body.appendChild(announcement);

    setTimeout(() => {
        announcement.remove();
    }, 1000);
}

// Page Load Complete
console.log('Łukasz Jagiełło Photography - Site initialized');

// Export functions for use in other modules
window.photographyApp = {
    trackEvent,
    showMessage,
    isValidEmail
};
