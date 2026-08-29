(() => {
    // Tab Navigation (retained; no-op when a page has no tabs)
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            const target = document.querySelector(`[data-tab-content="${targetTab}"]`);
            if (target) target.classList.add('active');
        });
    });

    // Modal functionality
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.modal-close');
    const openBtns = document.querySelectorAll('[data-open-modal]');

    // Project data — grounded in the public repositories on
    // github.com/JayabrataBasu. No metrics or details are invented here.
    const projectData = {
        zeldaa: {
            title: 'Zeldaa',
            category: 'Game',
            description: 'A small 2D RPG built with Python and Pygame.',
            overview: 'Zeldaa is a student project built with Python and Pygame for a university course (21CSS101J). It keeps to a modest scope — a tile-based world to move through, using Creative Commons artwork — and was made mostly for the enjoyment of putting a game together.',
            techStack: ['Python', 'Pygame'],
            links: [
                { label: 'View Code', url: 'https://github.com/JayabrataBasu/ZELDAA', primary: true }
            ],
            images: [
                'assets/images/Zeldaa-1.png',
                'assets/images/Zeldaa-2.png',
                'assets/images/Zeldaa-3.png'
            ]
        },
        veridical: {
            title: 'VeridicalDB',
            category: 'Database',
            description: 'A modern, embeddable database engine built from scratch in Go.',
            overview: 'VeridicalDB is a relational database engine written from scratch in Go. It can run embedded inside an application or as a client–server database speaking the PostgreSQL wire protocol. Storage covers both row-oriented and columnar layouts, with MVCC transactions for concurrent access.',
            features: [
                'Row and columnar storage engines',
                'ACID transactions with snapshot isolation (MVCC)',
                'B-tree indexing and write-ahead logging',
                'SQL across DDL, DML and DQL — JOINs, CTEs, window functions',
                'Stored procedures, triggers, full-text search and JSON support',
                'User management, role-based access control and TLS',
                'PostgreSQL wire-protocol compatibility; Docker support'
            ],
            techStack: ['Go', 'SQL', 'Docker'],
            links: [
                { label: 'View Repository', url: 'https://github.com/JayabrataBasu/VeridicalDB', primary: true }
            ]
        },
        axiom: {
            title: 'Axiom',
            category: 'Application',
            description: 'A cross-platform application built with Flutter.',
            overview: 'Axiom is a work-in-progress Flutter application, built from a single Dart codebase with Android, iOS and desktop targets.',
            techStack: ['Dart', 'Flutter'],
            links: [
                { label: 'View Code', url: 'https://github.com/JayabrataBasu/AXIOM', primary: true }
            ]
        },
        harvestforgood: {
            title: 'HarvestForGood',
            category: 'Website',
            description: 'A platform dedicated to advancing sustainable agriculture, food security, and climate resilience.',
            overview: 'HarvestForGood is a web platform built to bring together stakeholders from business, policy, and research, fostering innovation across the agri-food ecosystem. It is organised around three pillars.',
            features: [
                'Business — economically viable sustainability models and environmental stewardship in agriculture',
                'Policy — governance frameworks and regulatory incentives for sustainable practice',
                'Research — food security, climate resilience and ecosystem health'
            ],
            techStack: ['Next.js', 'Tailwind CSS', 'TypeScript'],
            links: [
                { label: 'View Repository', url: 'https://github.com/JayabrataBasu/HarvestForGood', primary: true }
            ]
        }
    };

    // Open modal
    openBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const projectId = btn.dataset.openModal;
            const project = projectData[projectId];
            if (project) {
                renderProjectModal(project);
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Render project modal content — every section is optional
    function renderProjectModal(project) {
        const techStackHTML = (project.techStack || [])
            .map(tech => `<span class="tech-chip">${tech}</span>`).join('');

        const linksHTML = (project.links || [])
            .map(link => `<a class="btn ${link.primary ? 'primary' : 'secondary'}" href="${link.url}" target="_blank" rel="noopener">${link.label}</a>`)
            .join('');

        const overviewHTML = project.overview
            ? `<h3>Overview</h3><p>${project.overview}</p>` : '';

        const featuresHTML = (project.features && project.features.length)
            ? `<h3>Key Features</h3><ul>${project.features.map(f => `<li>${f}</li>`).join('')}</ul>` : '';

        const notesHTML = project.notes
            ? `<h3>Notes</h3><p>${project.notes}</p>` : '';

        const imagesHTML = (project.images && project.images.length) ? `
            <div class="project-gallery">
                <h3>Gallery</h3>
                <div class="gallery-grid">
                    ${project.images.map(img => `
                        <img src="${img}" alt="${project.title} screenshot" class="project-detail-image" loading="lazy">
                    `).join('')}
                </div>
            </div>
        ` : '';

        modalContent.innerHTML = `
            <div class="modal-header">
                <div class="tech-pill">${project.category}</div>
                <h2>${project.title}</h2>
                <p class="lede">${project.description}</p>
                ${techStackHTML ? `<div class="modal-meta">${techStackHTML}</div>` : ''}
            </div>

            <div class="modal-body">
                ${overviewHTML}
                ${imagesHTML}
                ${featuresHTML}
                ${notesHTML}
            </div>

            ${linksHTML ? `<div class="modal-footer">${linksHTML}</div>` : ''}
        `;
    }

    // Initialize Card Slideshows for entries that have images
    function initCardSlideshows() {
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            const projectId = card.dataset.project;
            const project = projectData[projectId];

            if (project && project.images && project.images.length > 0) {
                const imageContainer = card.querySelector('.card-image');

                if (imageContainer) {
                    const slideshowDiv = document.createElement('div');
                    slideshowDiv.className = 'card-slideshow';

                    project.images.forEach((imgSrc, index) => {
                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.alt = `${project.title} preview ${index + 1}`;
                        if (index === 0) img.classList.add('active');
                        slideshowDiv.appendChild(img);
                    });

                    imageContainer.parentNode.insertBefore(slideshowDiv, imageContainer);
                    imageContainer.remove();

                    if (project.images.length > 1) {
                        let currentIndex = 0;
                        const images = slideshowDiv.querySelectorAll('img');

                        setInterval(() => {
                            images[currentIndex].classList.remove('active');
                            currentIndex = (currentIndex + 1) % images.length;
                            images[currentIndex].classList.add('active');
                        }, 3200);
                    }
                }
            }
        });
    }

    initCardSlideshows();
})();
