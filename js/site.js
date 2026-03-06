(() => {
    const body = document.body;
    const currentPage = body.dataset.page;
    const navLinks = document.querySelectorAll('.nav-link');
    const sidebar = document.querySelector('.sidebar');
    const pageNames = {
        home: 'Home',
        about: 'About',
        cv: 'CV',
        projects: 'Projects',
        contact: 'Contact'
    };

    if (currentPage) {
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            const isCurrent =
                (currentPage === 'home' && href === 'index.html') ||
                (currentPage === 'about' && href === 'about.html') ||
                (currentPage === 'cv' && href === 'cv.html') ||
                (currentPage === 'projects' && href === 'projects.html') ||
                (currentPage === 'contact' && href === 'contact.html');

            link.classList.toggle('active', isCurrent);
        });
    }

    if (!sidebar) {
        return;
    }

    const nav = sidebar.querySelector('.sidebar-nav');
    if (!nav) {
        return;
    }

    const mobileQuery = window.matchMedia('(max-width: 640px)');
    sidebar.id = sidebar.id || 'site-navigation';

    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'mobile-nav-handle';
    handle.setAttribute('aria-controls', sidebar.id);
    handle.setAttribute('aria-expanded', 'false');
    handle.setAttribute('aria-label', 'Open navigation menu');
    handle.innerHTML = [
        '<span class="mobile-nav-icon" aria-hidden="true">',
        '<span></span>',
        '<span></span>',
        '<span></span>',
        '</span>'
    ].join('');

    body.prepend(handle);

    const setOpen = (isOpen) => {
        const shouldOpen = mobileQuery.matches && isOpen;
        sidebar.classList.toggle('is-open', shouldOpen);
        body.classList.toggle('nav-open', shouldOpen);
        handle.setAttribute('aria-expanded', String(shouldOpen));
        handle.setAttribute('aria-label', shouldOpen ? 'Close navigation menu' : 'Open navigation menu');
    };

    handle.addEventListener('click', () => {
        setOpen(!sidebar.classList.contains('is-open'));
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileQuery.matches) {
                setOpen(false);
            }
        });
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && sidebar.classList.contains('is-open')) {
            setOpen(false);
        }
    });



    const syncViewportState = () => {
        if (!mobileQuery.matches) {
            setOpen(false);
        }
    };

    if (typeof mobileQuery.addEventListener === 'function') {
        mobileQuery.addEventListener('change', syncViewportState);
    } else if (typeof mobileQuery.addListener === 'function') {
        mobileQuery.addListener(syncViewportState);
    }
})();

