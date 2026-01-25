/**
 * CSS Houdini Ring Particles Background
 * Registers the paint worklet and handles mouse interactivity
 */

// Check if the browser supports Paint Worklets
if ('paintWorklet' in CSS) {
    // --- 1. CREATE THE CONTAINER ---
    let container = document.getElementById('particle-bg');
    if (!container) {
        container = document.createElement('div');
        container.id = 'particle-bg';
        document.body.insertBefore(container, document.body.firstChild);
    }

    // --- 2. REGISTER THE PAINT WORKLET ---
    CSS.paintWorklet.addModule(
        'https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js'
    );

    // --- 3. SETUP MOUSE INTERACTIVITY ---
    // Update particle center position on mouse move
    window.addEventListener('pointermove', (e) => {
        // Calculate mouse position as a percentage of the viewport
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;

        // Update the CSS custom properties
        container.style.setProperty('--ring-x', xPercent);
        container.style.setProperty('--ring-y', yPercent);
    }, { passive: true });

    // Reset to center when mouse leaves the window
    document.body.addEventListener('pointerleave', () => {
        container.style.setProperty('--ring-x', 50);
        container.style.setProperty('--ring-y', 50);
    });

    console.log('CSS Houdini Ring Particles initialized successfully.');
} else {
    console.log('CSS Paint Worklets are not supported in this browser. Falling back to solid background.');
    
    // Create container with fallback styling
    let container = document.getElementById('particle-bg');
    if (!container) {
        container = document.createElement('div');
        container.id = 'particle-bg';
        document.body.insertBefore(container, document.body.firstChild);
    }
}
