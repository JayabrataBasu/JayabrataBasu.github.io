/**
 * CSS Houdini Ring Particles Background - JS DRIVEN ANIMATION
 * We manually update CSS properties from JS to guarantee movement and color shifting
 * regardless of CSS @property support issues.
 */

// Check if the browser supports Paint Worklets
if ('paintWorklet' in CSS) {
    let container = document.getElementById('particle-bg');
    if (!container) {
        container = document.createElement('div');
        container.id = 'particle-bg';
        document.body.insertBefore(container, document.body.firstChild);
    }

    // Register worklet
    CSS.paintWorklet.addModule(
        'https://unpkg.com/css-houdini-ringparticles/dist/ringparticles.js'
    );

    // --- ANIMATION STATE ---
    const STATE = {
        tick: 0,
        radiusBase: 220,
        radiusAmp: 60,   // Breathing strength
        colorHue: 217,   // Start at Blue (HSV)
        centerX: 50,
        centerY: 50,
        mouseX: 0,
        mouseY: 0,
        targetMouseX: 0,
        targetMouseY: 0
    };

    // --- MOUSE TRACKING ---
    window.addEventListener('pointermove', (e) => {
        // -1 to +1 range
        STATE.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        STATE.targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    // --- MAIN ANIMATION LOOP ---
    function animate() {
        // 1. Time Progression
        STATE.tick += 0.01;

        // 2. Pulsating Breathing (Sine Wave)
        // Oscillates radius between 160 and 280
        const currentRadius = STATE.radiusBase + Math.sin(STATE.tick * 1.5) * STATE.radiusAmp;
        
        // 3. Color Cycling (Hue Rotation)
        // Cycles through full spectrum slowly
        STATE.colorHue = (STATE.colorHue + 0.5) % 360; // 0.5 deg per frame
        const currentColor = `hsl(${STATE.colorHue}, 80%, 60%)`; // High saturation/lightness for visibility

        // 4. Smooth Mouse Parallax
        const damp = 0.05;
        STATE.mouseX += (STATE.targetMouseX - STATE.mouseX) * damp;
        STATE.mouseY += (STATE.targetMouseY - STATE.mouseY) * damp;

        // 5. Gentle Drift (Figure-8 pattern)
        const driftX = Math.cos(STATE.tick * 0.3) * 5; // +/- 5% drift
        const driftY = Math.sin(STATE.tick * 0.5) * 5;

        // Combine drift + mouse parallax (mouse influence = 10%)
        const finalX = 50 + driftX + (STATE.mouseX * 10);
        const finalY = 50 + driftY + (STATE.mouseY * 10);

        // --- UPDATE CSS PROPERTIES ---
        // We write directly to the style object to force repaint
        container.style.setProperty('--ring-radius', currentRadius);
        container.style.setProperty('--particle-color', currentColor);
        container.style.setProperty('--ring-x', finalX);
        container.style.setProperty('--ring-y', finalY);
        container.style.setProperty('--animation-tick', STATE.tick);

        requestAnimationFrame(animate);
    }

    // Start Loop
    animate();

    console.log('JS-Driven Houdini Particles initialized.');
} else {
    // Fallback handled in CSS
    console.log('PaintWorklet not supported.');
}
