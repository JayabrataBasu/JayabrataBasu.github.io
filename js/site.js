(() => {
    // Simple navigation highlighting
    const currentPage = document.body.dataset.page;
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (currentPage) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (
                (currentPage === 'home' && href === 'index.html') ||
                (currentPage === 'about' && href === 'about.html') ||
                (currentPage === 'cv' && href === 'cv.html') ||
                (currentPage === 'projects' && href === 'projects.html') ||
                (currentPage === 'contact' && href === 'contact.html')
            ) {
                link.classList.add('active');
            }
        });
    }
})();

