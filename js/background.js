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

            // Speed & Randomness - INCREASED VARIANCE
            const speedVar = (rng.next() * 2.0 + 0.5); // Much wider speed range (0.5x to 2.5x)
            const sizeVar = rng.next() * 1.5;
            const phaseX = rng.next() * Math.PI * 2; // Random phase for sway

            // MOVEMENT: "Tidal Pulse" (Waves & Tides)
            // No continuous rotation. Rhythmic expansion/contraction (Tides) and Sway (Waves).

            // 1. TIDE (Radial Pulse)
            // Particles move In and Out from center.
            // Phase depends on angle -> Creates a "Wave" traveling around the ring
            const tideFreq = 1.5; 
            const tidePhase = angleOffset * 4; // 4 wave crests around the ring
            const tideAmp = 60 + (rng.next() * 40); // Variance in pulse distance
            
            const tideOffset = Math.sin(tick * tideFreq + tidePhase) * tideAmp;
            
            // 2. SWAY (Tangential Wave)
            // Particles rock left/right relative to their sector
            const swayFreq = 1.0;
            const swayAmp = 0.1; // Radians
            const swayOffset = Math.cos(tick * swayFreq + phaseX) * swayAmp;

            // Apply Motions
            const currentRadius = baseRadius + tideOffset;
            const currentAngle = angleOffset + swayOffset;

            // Position
            const x = centerX + Math.cos(currentAngle) * currentRadius;
            const y = centerY + Math.sin(currentAngle) * currentRadius;

            // VELOCITY for Orientation
            // Derivative of Position for alignment
            const dr_dt = tideFreq * Math.cos(tick * tideFreq + tidePhase) * tideAmp;
            const da_dt = -swayFreq * Math.sin(tick * swayFreq + phaseX) * swayAmp;
            
            const vx = (dr_dt * Math.cos(currentAngle)) - (currentRadius * Math.sin(currentAngle) * da_dt);
            const vy = (dr_dt * Math.sin(currentAngle)) + (currentRadius * Math.cos(currentAngle) * da_dt);

            const moveAngle = Math.atan2(vy, vx);

            // --- RADIAL ALPHA MASK ---
            const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
            const fadeStart = 200; 
            const fadeEnd = 400;   
            
            let alpha = (distFromCenter - fadeStart) / (fadeEnd - fadeStart);
            alpha = Math.max(0, Math.min(1, alpha));
            alpha *= 0.7; 

            // --- COLOR (Everforest Palette) ---
            const normalizedX = x / size.width;
            const normalizedY = y / size.height;
            let r, g, b;
            const lerp = (start, end, t) => start + (end - start) * t;

            // Base Gradient: Everforest Aqua (Left) -> Blue (Right)
            // Aqua #83C092 = rgb(131, 192, 146)
            // Blue #3A94C5 = rgb(58, 148, 197)
            let baseR = lerp(131, 58, normalizedX);
            let baseG = lerp(192, 148, normalizedX);
            let baseB = lerp(146, 197, normalizedX);

            // Aqua at Bottom: #35A77C = rgb(53, 167, 124)
            if (normalizedY > 0.6) {
                 const tY = (normalizedY - 0.6) / 0.4; 
                 const mix = tY * tY; 
                 
                 baseR = lerp(baseR, 53, mix);
                 baseG = lerp(baseG, 167, mix);
                 baseB = lerp(baseB, 124, mix);
            }
            
            r = baseR;
            g = baseG;
            b = baseB;

            // --- DRAWING ---
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(moveAngle); 
            
            const currentSize = particleSizeBase + sizeVar;
            
            // Morphing
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
        STATE.tick += 0.02; 

        const sidebarWidth = 260; 
        const windowWidth = window.innerWidth;
        const visualCenterX = sidebarWidth + ((windowWidth - sidebarWidth) / 2);
        const visualCenterXPercent = (visualCenterX / windowWidth) * 100;

        const damp = 0.08; // More responsive dampening (was 0.05)
        STATE.mouseX += (STATE.targetMouseX - STATE.mouseX) * damp;
        STATE.mouseY += (STATE.targetMouseY - STATE.mouseY) * damp;

        // Increased Mouse Influence significantly (-3 -> -12)
        const finalX = visualCenterXPercent + (STATE.mouseX * -12);
        const finalY = 40 + (STATE.mouseY * -12); 

        const breathing = Math.sin(STATE.tick * 2.0) * 20; 
        
        container.style.setProperty('--ring-radius', STATE.radiusBase + breathing);
        container.style.setProperty('--ring-x', finalX);
        container.style.setProperty('--ring-y', finalY);
        container.style.setProperty('--animation-tick', STATE.tick);
        
        requestAnimationFrame(animate);
    }

    animate();
    console.log('Ripple Flow Particle Worklet initialized.');
} else {
    // Firefox/Safari: Add animated orb elements for background effect
    document.body.classList.add('no-paint-worklet');
    
    // Get or create the particle-bg container
    let container = document.getElementById('particle-bg');
    if (!container) {
        container = document.createElement('div');
        container.id = 'particle-bg';
        document.body.insertBefore(container, document.body.firstChild);
    }
    
    // Add the floating orb elements
    for (let i = 1; i <= 3; i++) {
        const orb = document.createElement('div');
        orb.className = `firefox-orb-${i}`;
        container.appendChild(orb);
    }
    
    console.log('Firefox fallback: Animated orbs initialized.');
}
