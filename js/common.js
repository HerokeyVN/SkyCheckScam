document.addEventListener('DOMContentLoaded', function () {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        
    `;
    document.head.appendChild(styleElement);

    const scrollToTop = document.getElementById('scrollToTop');
    if (scrollToTop) {
        scrollToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    const header = document.querySelector('header');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    document.querySelectorAll('.nav-btn').forEach(link => {
        link.addEventListener('click', function (e) {
            if (this.getAttribute('href').startsWith('#') && this.getAttribute('href').length > 1) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });

                    updateActiveNavTab(targetId);
                }
            }
        });
    });

    const languageLinks = document.querySelectorAll('.language-dropdown a');
    const currentLang = document.querySelector('.current-lang');

    languageLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const language = this.getAttribute('data-lang');
            currentLang.textContent = language.toUpperCase();
            console.log(`Switching language to: ${language}`);
        });
    });

    function updateActiveNavTab(currentSectionId) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        const activeButton = document.querySelector(`.nav-btn[href="${currentSectionId}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }
    }

    window.addEventListener('scroll', function () {
        if (!this.isScrolling) {
            this.isScrolling = true;
            setTimeout(() => {
                highlightNavBasedOnScroll();
                this.isScrolling = false;
            }, 100);
        }
    });

    setTimeout(highlightNavBasedOnScroll, 300);

    function highlightNavBasedOnScroll() {
        const sections = [
            document.getElementById('searchResults'),
            document.getElementById('recentReports'),
            document.getElementById('scamReportForm')
        ].filter(section => section !== null);

        const homeSection = {
            id: 'home',
            offsetTop: 0,
            getBoundingClientRect: () => ({ top: -window.scrollY, bottom: window.innerHeight })
        };

        let currentSection = homeSection;
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;

            if (scrollPosition >= sectionTop - 100) {
                currentSection = section;
            }
        });

        updateActiveNavTab('#' + (currentSection.id || 'home'));
    }

    if (window.scrollY < 100) {
        updateActiveNavTab('#');
    }

    if (typeof translations !== 'undefined') {
        initializeLanguageSystem(translations);
    } else {
        console.error('Translations not loaded. Make sure translations.js is included before common.js');
    }

    function initializeLanguageSystem(translations) {
        const setLanguage = (lang) => {
            document.documentElement.lang = lang;
            document.querySelector('.current-lang').textContent = lang.toUpperCase();
            localStorage.setItem('preferredLanguage', lang);

            document.querySelectorAll('[data-lang-key]').forEach(element => {
                const key = element.getAttribute('data-lang-key');
                const translation = translations[lang]?.[key];

                if (translation) {
                    if (element.placeholder) {
                        element.placeholder = translation;
                    } else if (element.tagName === 'TITLE') {
                        element.textContent = translation;
                    } else if (key === 'footerCopyright') {
                        element.innerHTML = translation;
                    } else {
                        element.textContent = translation;
                    }
                } else {
                    console.warn(`Translation key "${key}" not found for language "${lang}".`);
                }
            });
        };

        const preferredLanguage = localStorage.getItem('preferredLanguage') || 'en';
        setLanguage(preferredLanguage);

        document.querySelectorAll('.language-dropdown a').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const lang = link.getAttribute('data-lang');
                setLanguage(lang);
            });
        });
    }

    const scrollToTopBtn = document.getElementById('scrollToTop');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });

        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    } else {
        console.warn("Scroll to top button element not found.");
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // Mobile menu functionality
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mobileNav = document.getElementById('mobileNav');
    const mobileMenuLinks = document.querySelectorAll('.mobile-menu-nav .nav-btn');

    const body = document.body;

    // Function to toggle mobile menu
    function toggleMobileMenu() {
        mobileMenuToggle.classList.toggle('active');
        mobileNav.classList.toggle('active');

        // Prevent body scrolling when menu is open
        if (mobileNav.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    }

    // Toggle menu when button is clicked
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close menu when clicking outside menu content
    if (mobileNav) {
        mobileNav.addEventListener('click', function (e) {
            if (e.target === mobileNav) {
                toggleMobileMenu();
            }
        });
    }

    // Close menu when nav link is clicked
    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', function () {
            toggleMobileMenu();

            // Add active class to clicked link
            mobileMenuLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Sync active link between desktop and mobile menu
    function syncActiveNavLink() {
        const activeDesktopLink = document.querySelector('.nav-buttons .nav-btn.active');
        if (activeDesktopLink) {
            const href = activeDesktopLink.getAttribute('href');
            const matchingMobileLink = document.querySelector(`.mobile-menu-nav .nav-btn[href="${href}"]`);
            if (matchingMobileLink) {
                mobileMenuLinks.forEach(link => link.classList.remove('active'));
                matchingMobileLink.classList.add('active');
            }
        }
    }

    // Sync active link on page load and when it changes
    syncActiveNavLink();
    const observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.attributeName === 'class') {
                syncActiveNavLink();
            }
        });
    });

    document.querySelectorAll('.nav-buttons .nav-btn').forEach(button => {
        observer.observe(button, { attributes: true });
    });
});