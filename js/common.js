// Common utility functions and shared UI handling

document.addEventListener('DOMContentLoaded', function() {
    // Animation styles
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        @keyframes typing {
            0%, 100% { border-color: transparent; }
            50% { border-color: #eca08f; }
        }
        
        .search-box.typing {
            border-right: 2px solid #eca08f;
            animation: typing 0.6s infinite;
        }
        
        .btn-clicked {
            animation: btnPulse 0.5s ease;
        }
        
        @keyframes btnPulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }
        
        .particle {
            animation: fadeOut 1s ease forwards;
        }
        
        @keyframes fadeOut {
            0% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.3); }
        }
        
        .search.focus {
            border: 2px solid #eca08f;
            box-shadow: 0 0 20px rgba(236, 160, 143, 0.5);
        }
    `;
    document.head.appendChild(styleElement);
    
    // Scroll to top button functionality
    const scrollToTop = document.getElementById('scrollToTop');
    if (scrollToTop) {
        scrollToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Add header scroll effect
    const header = document.querySelector('header');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
});
