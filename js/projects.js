(() => {
    // Tab Navigation
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update active states
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.querySelector(`[data-tab-content="${targetTab}"]`).classList.add('active');
        });
    });

    // Modal functionality
    const modal = document.getElementById('projectModal');
    const modalContent = document.getElementById('modalContent');
    const closeBtn = document.querySelector('.modal-close');
    const openBtns = document.querySelectorAll('[data-open-modal]');

    // Project data
    const projectData = {
        zeldaa: {
            title: 'Zeldaa',
            category: 'Game Development',
            description: 'A 2D adventure game inspired by classic titles, built using Python and Pygame. Features include a rich storyline, puzzle-solving elements, and an immersive pixel-art world inspired by The Legend of Zelda series.',
            overview: 'Zeldaa reimagines classic adventure gameplay with modern development practices. The game features a tile-based world, dynamic lighting, enemy AI with pathfinding, and a custom event system for rich storytelling.',
            features: [
                'Pixel-perfect collision detection and physics',
                'Custom particle system for visual effects',
                'Event-driven narrative system with branching dialogue',
                'Enemy AI with A* pathfinding algorithm',
                'Dynamic lighting and shadow casting',
                'Inventory and equipment management',
                'Save/Load system with JSON serialization'
            ],
            techStack: ['Python', 'Pygame', 'JSON', 'Git'],
            challenges: 'Implementing efficient collision detection for hundreds of entities while maintaining 60 FPS was the primary challenge. Solved by implementing spatial partitioning with a quadtree data structure.',
            links: [
                { label: 'View Code', url: '#', primary: true },
                { label: 'Play Demo', url: '#', primary: false }
            ],
            images: [
                'assets/images/Zeldaa-1.png',
                'assets/images/Zeldaa-2.png',
                'assets/images/Zeldaa-3.png'
            ]
        },
        veridical: {
            title: 'VeridicalDb',
            category: 'Database Systems',
            description: 'A high-performance, distributed database engine optimized for low-latency queries and horizontal scalability. Designed for modern, data-intensive applications.',
            overview: 'VeridicalDb is a from-scratch implementation of a distributed key-value store with ACID guarantees. Built with Go for performance and reliability, it implements consensus via Raft and supports both strong and eventual consistency modes.',
            features: [
                'Distributed consensus using Raft algorithm',
                'Configurable consistency levels (strong/eventual)',
                'Automatic sharding and rebalancing',
                'Write-ahead logging (WAL) for durability',
                'Snapshot-based backups and point-in-time recovery',
                'gRPC API with client libraries',
                'Prometheus metrics and structured logging'
            ],
            techStack: ['Go', 'gRPC', 'Raft', 'Make', 'Git'],
            challenges: 'Ensuring data consistency during network partitions while maintaining low latency required careful tuning of the Raft implementation and implementing clever caching strategies at the client level.',
            links: [
                { label: 'View Repository', url: '#', primary: true },
                { label: 'Documentation', url: '#', primary: false }
            ]
        },
        pipeline: {
            title: 'Event Pipeline',
            category: 'Systems Engineering',
            description: 'Lightweight, observable ingestion path for telemetry with budgeted latency and simple replay capabilities. Built for real-time data processing.',
            overview: 'A high-throughput event ingestion pipeline designed to handle millions of events per second with predictable latency. Implements backpressure handling, circuit breakers, and automatic retries.',
            features: [
                'Sub-millisecond p99 latency at scale',
                'Automatic batching and compression',
                'Circuit breaker pattern for fault tolerance',
                'Structured logging with correlation IDs',
                'Replay functionality for debugging',
                'Schema validation and evolution support',
                'Grafana dashboards for monitoring'
            ],
            techStack: ['Go', 'Kafka', 'Prometheus', 'Docker'],
            challenges: 'Achieving consistent sub-millisecond latency under heavy load required careful profiling and optimization, including lock-free data structures and memory pooling to reduce GC pressure.',
            links: [
                { label: 'Technical Write-up', url: '#', primary: true }
            ]
        },
        harvestforgood: {
            title: 'HarvestForGood',
            category: 'Website Development',
            description: 'Lightweight, observable ingestion path for telemetry with budgeted latency and simple replay capabilities. Built for real-time data processing.',
            overview: 'A high-throughput event ingestion pipeline designed to handle millions of events per second with predictable latency. Implements backpressure handling, circuit breakers, and automatic retries.',
            features: [
                'Sub-millisecond p99 latency at scale',
                'Automatic batching and compression',
                'Circuit breaker pattern for fault tolerance',
                'Structured logging with correlation IDs',
                'Replay functionality for debugging',
                'Schema validation and evolution support',
                'Grafana dashboards for monitoring'
            ],
            techStack: ['Go', 'Kafka', 'Prometheus', 'Docker'],
            challenges: 'Achieving consistent sub-millisecond latency under heavy load required careful profiling and optimization, including lock-free data structures and memory pooling to reduce GC pressure.',
            links: [
                { label: 'Technical Write-up', url: '#', primary: true }
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

    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC key to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Render project modal content
    function renderProjectModal(project) {
        const techStackHTML = project.techStack.map(tech => 
            `<span class="tech-chip">${tech}</span>`
        ).join('');

        const linksHTML = project.links.map(link => 
            `<a class="btn ${link.primary ? 'primary' : ''}" href="${link.url}" target="_blank">${link.label}</a>`
        ).join('');

        const featuresHTML = project.features.map(feature => 
            `<li>${feature}</li>`
        ).join('');

        const imagesHTML = project.images ? `
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
                <div class="modal-meta">
                    ${techStackHTML}
                </div>
            </div>

            <div class="modal-body">
                <h3>Overview</h3>
                <p>${project.overview}</p>

                ${imagesHTML}

                <h3>Key Features</h3>
                <ul>
                    ${featuresHTML}
                </ul>

                <h3>Technical Challenges</h3>
                <p>${project.challenges}</p>
            </div>

            <div class="modal-footer">
                ${linksHTML}
            </div>
        `;
    }
    // Initialize Card Slideshows
    function initCardSlideshows() {
        // Find all project cards
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            const projectId = card.dataset.project;
            const project = projectData[projectId];
            
            // Only proceed if project exists and has images
            if (project && project.images && project.images.length > 0) {
                const imageContainer = card.querySelector('.card-image');
                
                // If there's a placeholder container, replace it or populate it
                if (imageContainer) {
                    // Create slideshow container
                    const slideshowDiv = document.createElement('div');
                    slideshowDiv.className = 'card-slideshow';
                    
                    // Create image elements
                    project.images.forEach((imgSrc, index) => {
                        const img = document.createElement('img');
                        img.src = imgSrc;
                        img.alt = `${project.title} preview ${index + 1}`;
                        if (index === 0) img.classList.add('active');
                        slideshowDiv.appendChild(img);
                    });
                    
                    // Insert slideshow and remove placeholder
                    imageContainer.parentNode.insertBefore(slideshowDiv, imageContainer);
                    imageContainer.remove();
                    
                    // Start slideshow interval (only if multiple images)
                    if (project.images.length > 1) {
                        let currentIndex = 0;
                        const images = slideshowDiv.querySelectorAll('img');
                        
                        setInterval(() => {
                            images[currentIndex].classList.remove('active');
                            currentIndex = (currentIndex + 1) % images.length;
                            images[currentIndex].classList.add('active');
                        }, 3000); // Change every 3 seconds
                    }
                }
            }
        });
    }

    // Initialize slideshows on load
    initCardSlideshows();

})();
