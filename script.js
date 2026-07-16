// ============================================
// CONFIGURATION
// ============================================
// TODO: Replace with your deployed Vercel API URL (no trailing slash).
// Example: "https://your-portfolio-api.vercel.app"
const API_BASE_URL = "https://elaroui-mohammed-f4du.vercel.app/";

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================
       1. DARK MODE TOGGLE
       - Keyboard accessible (Enter/Space)
       - Persists choice in localStorage
       - Falls back to OS preference on first visit
    ============================================ */
    const toggle = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const THEME_KEY = 'portfolio-theme';

    const applyTheme = (theme) => {
        const isDark = theme === 'dark';
        body.classList.toggle('dark-theme', isDark);
        if (toggle) toggle.setAttribute('aria-pressed', String(isDark));
    };

    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    }

    const toggleTheme = () => {
        const nextTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
        applyTheme(nextTheme);
        localStorage.setItem(THEME_KEY, nextTheme);
    };

    if (toggle) {
        toggle.setAttribute('role', 'button');
        toggle.setAttribute('tabindex', '0');
        toggle.setAttribute('aria-pressed', String(body.classList.contains('dark-theme')));

        toggle.addEventListener('click', toggleTheme);
        toggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTheme();
            }
        });
    }

    /* ============================================
       2. MOBILE NAVIGATION MENU
    ============================================ */
    const menuBtn = document.getElementById('menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuBtn.classList.toggle('open', isOpen);
            menuBtn.setAttribute('aria-expanded', String(isOpen));
        });

        // Close the menu after tapping a link (mobile UX)
        navLinks.querySelectorAll('.link').forEach((link) => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                menuBtn.classList.remove('open');
                menuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    /* ============================================
       3. ACTIVE NAV LINK ON SCROLL
    ============================================ */
    const sections = document.querySelectorAll('main [id]');
    const navAnchors = document.querySelectorAll('.nav-links .link');

    if (sections.length && navAnchors.length && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute('id');
                    navAnchors.forEach((a) => {
                        a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
                    });
                }
            });
        }, { rootMargin: '-40% 0px -55% 0px', threshold: 0 });

        sections.forEach((section) => observer.observe(section));
    }

    /* ============================================
       4. CONTACT FORM → VERCEL API → MONGODB
    ============================================ */
    const form = document.getElementById('contact-form');
    const notification = document.getElementById('notification');
    let notificationTimeout;

    const showNotification = (message, type = 'success') => {
        if (!notification) return;
        clearTimeout(notificationTimeout);
        notification.textContent = message;
        notification.className = `show ${type}`;
        notificationTimeout = setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    };

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('.submit');
            const originalText = submitBtn.textContent;
            const payload = {
                name: form.name.value.trim(),
                email: form.email.value.trim(),
                message: form.message.value.trim(),
            };

            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            try {
                const response = await fetch(`${API_BASE_URL}/api/contact`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                });

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.message || 'Something went wrong. Please try again.');
                }

                showNotification("Message sent! I'll get back to you soon.", 'success');
                form.reset();
            } catch (error) {
                showNotification(error.message || 'Failed to send message. Please try again.', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }
});