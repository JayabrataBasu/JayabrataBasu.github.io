/**
 * CSS Houdini Particle Background - Custom Worklet Implementation
 * Replaces external 'ringparticles.js' with custom "Ripple Flow" logic.
 * 
 * UPDATES:
 * - DENSITY: Increased to 600 particles.
 * - SHAPE: Shorter pills (max 1.5x length).
 * - MOVEMENT: "Ripple/Random" instead of Orbit. Added sine-wave flow and randomized drift.
 * - SPEED: Increased base speed.
 * - PERIPHERY: Retained radial alpha mask.
 */

const workletCode = `
class Random {
    constructor(seed) {
        this.state = seed;
    }
    next() {
        this.state = (this.state * 9301 + 49297) % 233280;
        return this.state / 233280;
    }
}

class ParticleRing {
    static get inputProperties() {
        return [
            '--ring-radius', 
            '--ring-x', 
            '--ring-y', 
            '--animation-tick'
        ];
    }

    paint(ctx, size, props) {
        const radiusBase = parseFloat(props.get('--ring-radius').toString()) || 450;
        const cxPercent = parseFloat(props.get('--ring-x').toString()) || 60; 
        const cyPercent = parseFloat(props.get('--ring-y').toString()) || 50;
        const tick = parseFloat(props.get('--animation-tick').toString()) || 0;

        const centerX = (cxPercent / 100) * size.width;
        const centerY = (cyPercent / 100) * size.height;

        // Configuration
        const particleCount = 2000; // Even more density for full coverage
        const particleSizeBase = 1.3; 
        
        const morphCycle = (Math.sin(tick * 1.5) + 1) / 2; 
        
        const rng = new Random(12345);

        for (let i = 0; i < particleCount; i++) {
            const angleOffset = rng.next() * Math.PI * 2;
            
            // DISTRIBUTION: Huge periphery coverage
            // We want particles to reach the sidebar.
            // If Center X is ~1000px, Sidebar is at x=260. We need reach of ~800px.
            // Base radius 500, Spread +/- 450 => Range 50 to 950.
            const radiusVar = (rng.next() - 0.5) * 900; 
            const baseRadius = 550 + radiusVar;

            // Speed & Randomness
            const speedVar = (rng.next() * 0.8 + 0.8); 
            const sizeVar = rng.next() * 1.5;
            const randomDriftPhase = rng.next() * Math.PI * 2;

            // MOVEMENT: "Ripple / Random"
            let currentAngle = angleOffset + (tick * 0.1 * speedVar);
            
            // Sine wave ripple
            const ripple = Math.sin((tick * 2) - (baseRadius * 0.05)); 
            const rippleAmp = 20;
            
            const drift = Math.sin(tick * 1.0 + randomDriftPhase) * 15;
            
            const currentRadius = baseRadius + (ripple * rippleAmp) + drift;

            // Position
            const x = centerX + Math.cos(currentAngle) * currentRadius;
            const y = centerY + Math.sin(currentAngle) * currentRadius;

            // --- RADIAL ALPHA MASK ---
            const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const fadeStart = 200; // Reduced further to allow inner particles
            const fadeEnd = 400;   
            
            let alpha = (distFromCenter - fadeStart) / (fadeEnd - fadeStart);
            alpha = Math.max(0, Math.min(1, alpha));
            
            // Distance falloff logic:
            // We want particles far away (on the left side) to be visible.
            // But we don't want strict ring.
            
            alpha *= 0.7; 

            // --- COLOR ---
            const normalizedX = x / size.width;
            let r, g, b;
            const lerp = (start, end, t) => start + (end - start) * t;

            if (normalizedX < 0.4) {
               const localT = Math.max(0, Math.min(1, normalizedX / 0.4));
               r = 255;
               g = lerp(255, 0, localT);
               b = lerp(0, 255, localT);
            } else {
               const localT = Math.max(0, Math.min(1, (normalizedX - 0.4) / 0.6));
               r = lerp(255, 66, localT);
               g = lerp(0, 133, localT);
               b = lerp(255, 244, localT);
            }

            // --- DRAWING ---
            const angle = Math.atan2(y - centerY, x - centerX);
            const wobble = Math.sin(tick * 2 + randomDriftPhase) * 0.2;
            
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle + Math.PI / 2 + wobble); 
            
            const currentSize = particleSizeBase + sizeVar;
            
            // Morphing - SHORT PILLS
            const minW = currentSize * 0.6; 
            const minH = currentSize * 0.6;
            
            const maxW = currentSize * 1.5; 
            const maxH = currentSize * 0.9; 
            
            const finalW = lerp(minW, maxW, morphCycle);
            const finalH = lerp(minH, maxH, morphCycle);
            
            ctx.fillStyle = \`rgba(\${Math.round(r)}, \${Math.round(g)}, \${Math.round(b)}, \${alpha})\`;
            
            if (alpha > 0.01) {
                ctx.beginPath();
                ctx.ellipse(0, 0, finalW, finalH, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }
    }
}

registerPaint('ring-particles', ParticleRing);
`;

if ('paintWorklet' in CSS) {
    let container = document.getElementById('particle-bg');
    if (!container) {
        container = document.createElement('div');
        container.id = 'particle-bg';
        document.body.insertBefore(container, document.body.firstChild);
    }

    const blob = new Blob([workletCode], { type: 'text/javascript' });
    CSS.paintWorklet.addModule(URL.createObjectURL(blob));

    const STATE = {
        tick: 0,
        radiusBase: 480, 
        centerX: 50,
        centerY: 50,
        mouseX: 0,
        mouseY: 0,
        targetMouseX: 0,
        targetMouseY: 0
    };

    window.addEventListener('pointermove', (e) => {
        STATE.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
        STATE.targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    function animate() {
        STATE.tick += 0.02; // FASTER global tick

        const sidebarWidth = 260; 
        const windowWidth = window.innerWidth;
        const visualCenterX = sidebarWidth + ((windowWidth - sidebarWidth) / 2);
        const visualCenterXPercent = (visualCenterX / windowWidth) * 100;

        const damp = 0.05;
        STATE.mouseX += (STATE.targetMouseX - STATE.mouseX) * damp;
        STATE.mouseY += (STATE.targetMouseY - STATE.mouseY) * damp;

        const driftX = Math.cos(STATE.tick * 0.5) * 5; // Faster drift
        const driftY = Math.sin(STATE.tick * 0.7) * 5;

        const finalX = visualCenterXPercent + driftX + (STATE.mouseX * -3);
        const finalY = 40 + driftY + (STATE.mouseY * -3);

        const breathing = Math.sin(STATE.tick * 2.0) * 20; // Faster breathing
        
        container.style.setProperty('--ring-radius', STATE.radiusBase + breathing);
        container.style.setProperty('--ring-x', finalX);
        container.style.setProperty('--ring-y', finalY);
        container.style.setProperty('--animation-tick', STATE.tick);
        
        requestAnimationFrame(animate);
    }

    animate();
    console.log('Ripple Flow Particle Worklet initialized.');
} else {
    console.log('PaintWorklet not supported.');
}
