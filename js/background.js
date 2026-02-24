/**
 * CSS Houdini Particle Background — OPTIMIZED "Ripple Flow"
 *
 * Key Performance Improvements vs original:
 *  1. Static particle data (angle, radius, phase, color) pre-baked ONCE at init.
 *     Passed to the worklet each frame as a flat Float32Array → compact CSS string.
 *  2. Particle count reduced 2000 → 800 (visually equivalent, ~60% less work).
 *  3. Per-frame worklet: only computes sine/cosine for DYNAMIC values (tide, sway).
 *     Zero RNG calls inside paint().
 *  4. ctx.save()/restore() eliminated — replaced with ctx.setTransform + identity reset.
 *  5. Alpha < 0.01 guard checked BEFORE beginPath / ellipse / fill.
 *  6. fillStyle string built with integer channels (Math.round pre-applied).
 *  7. `will-change: contents` set on container hint for GPU compositing.
 */

// ─── WORKLET CODE ────────────────────────────────────────────────────────────
const workletCode = `
class ParticleRing {
    static get inputProperties() {
        return [
            '--ring-radius',
            '--ring-x',
            '--ring-y',
            '--animation-tick',
            '--particle-data'   // flat packed: [angle, baseR, tideAmp, tidePhase, swayPhase, sizeW, sizeH, r, g, b] × N
        ];
    }

    paint(ctx, size, props) {
        const tick     = parseFloat(props.get('--animation-tick').toString()) || 0;
        const cxPct    = parseFloat(props.get('--ring-x').toString())         || 60;
        const cyPct    = parseFloat(props.get('--ring-y').toString())         || 50;

        const cx = (cxPct / 100) * size.width;
        const cy = (cyPct / 100) * size.height;

        // Parse pre-baked particle data
        const dataStr  = props.get('--particle-data').toString().trim();
        if (!dataStr) return;

        const raw    = dataStr.split(',');
        const STRIDE = 10; // fields per particle
        const count  = (raw.length / STRIDE) | 0;

        const fadeStart = 200;
        const fadeEnd   = 400;
        const fadeRange = fadeEnd - fadeStart;

        const tideFreq = 1.5;
        const swayFreq = 1.0;

        for (let i = 0; i < count; i++) {
            const o = i * STRIDE;
            const angle     = +raw[o];
            const baseRad   = +raw[o + 1];
            const tideAmp   = +raw[o + 2];
            const tidePhase = +raw[o + 3];
            const swayPhase = +raw[o + 4];
            const fw        = +raw[o + 5];
            const fh        = +raw[o + 6];
            const cr        = +raw[o + 7];
            const cg        = +raw[o + 8];
            const cb        = +raw[o + 9];

            // Dynamic motion (only trig per frame)
            const tideOffset = Math.sin(tick * tideFreq + tidePhase) * tideAmp;
            const swayOffset = Math.cos(tick * swayFreq + swayPhase) * 0.1;

            const radius       = baseRad + tideOffset;
            const currentAngle = angle   + swayOffset;

            const x = cx + Math.cos(currentAngle) * radius;
            const y = cy + Math.sin(currentAngle) * radius;

            // --- Alpha ---
            const dist  = Math.sqrt((x - cx) * (x - cx) + (y - cy) * (y - cy));
            let   alpha = (dist - fadeStart) / fadeRange;
            alpha = alpha < 0 ? 0 : alpha > 1 ? 1 : alpha;
            alpha *= 0.7;

            if (alpha < 0.01) continue; // skip before any draw calls

            // --- Orientation ---
            const dr_dt    = tideFreq * Math.cos(tick * tideFreq + tidePhase) * tideAmp;
            const da_dt    = -swayFreq * Math.sin(tick * swayFreq + swayPhase) * 0.1;
            const vx       = dr_dt * Math.cos(currentAngle) - radius * Math.sin(currentAngle) * da_dt;
            const vy       = dr_dt * Math.sin(currentAngle) + radius * Math.cos(currentAngle) * da_dt;
            const moveAngle = Math.atan2(vy, vx);

            // --- Draw (no save/restore) ---
            const cos = Math.cos(moveAngle);
            const sin = Math.sin(moveAngle);
            ctx.setTransform(cos, sin, -sin, cos, x, y);

            ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + alpha.toFixed(3) + ')';
            ctx.beginPath();
            ctx.ellipse(0, 0, fw, fh, 0, 0, 6.283185307);
            ctx.fill();
        }

        // Reset transform
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}

registerPaint('ring-particles', ParticleRing);
`;

// ─── MAIN ─────────────────────────────────────────────────────────────────────
if ('paintWorklet' in CSS) {

    // ── Setup container ──────────────────────────────────────────────────────
    let container = document.getElementById('particle-bg');
    if (!container) {
        container = document.createElement('div');
        container.id = 'particle-bg';
        document.body.insertBefore(container, document.body.firstChild);
    }
    // GPU compositing hint
    container.style.willChange = 'contents';

    // ── Load worklet ─────────────────────────────────────────────────────────
    const blob = new Blob([workletCode], { type: 'text/javascript' });
    CSS.paintWorklet.addModule(URL.createObjectURL(blob));

    // ── Pre-bake static particle data ONCE ───────────────────────────────────
    const PARTICLE_COUNT  = 800;
    const STRIDE          = 10;
    const particleData    = new Float32Array(PARTICLE_COUNT * STRIDE);
    const morphMid        = 0.5; // mid-point for size bake (dynamic morphing removed — saves per-frame lerp)
    const particleSizeBase = 1.3;

    // Simple fast LCG for init only (never run again)
    let rngState = 12345;
    function rng() {
        rngState = (rngState * 9301 + 49297) % 233280;
        return rngState / 233280;
    }
    function lerp(a, b, t) { return a + (b - a) * t; }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const o = i * STRIDE;

        const angle      = rng() * Math.PI * 2;
        const radiusVar  = (rng() - 0.5) * 900;
        const baseRad    = 550 + radiusVar;
        const tideAmp    = 60 + rng() * 40;
        const tidePhase  = angle * 4;
        const swayPhase  = rng() * Math.PI * 2;
        const sizeVar    = rng() * 1.5;

        const sW = particleSizeBase + sizeVar;
        const fw = lerp(sW * 0.6, sW * 1.5, morphMid);
        const fh = lerp(sW * 0.6, sW * 0.9, morphMid);

        // Color — baked at representative screen position
        const normX = 0.5 + Math.cos(angle) * 0.3; // approximate x on-screen
        const normY = 0.5 + Math.sin(angle) * 0.3; // approximate y on-screen

        let bR = lerp(131, 58, normX);
        let bG = lerp(192, 148, normX);
        let bB = lerp(146, 197, normX);
        if (normY > 0.6) {
            const tY  = (normY - 0.6) / 0.4;
            const mix = tY * tY;
            bR = lerp(bR, 53, mix);
            bG = lerp(bG, 167, mix);
            bB = lerp(bB, 124, mix);
        }

        particleData[o]     = angle;
        particleData[o + 1] = baseRad;
        particleData[o + 2] = tideAmp;
        particleData[o + 3] = tidePhase;
        particleData[o + 4] = swayPhase;
        particleData[o + 5] = fw;
        particleData[o + 6] = fh;
        particleData[o + 7] = Math.round(bR);
        particleData[o + 8] = Math.round(bG);
        particleData[o + 9] = Math.round(bB);
    }

    // Convert to CSS-safe comma-separated string (set once, reused every frame)
    const PARTICLE_DATA_STRING = Array.from(particleData).join(',');
    container.style.setProperty('--particle-data', PARTICLE_DATA_STRING);

    // ── Animation state ───────────────────────────────────────────────────────
    const STATE = {
        tick: 0,
        radiusBase: 480,
        mouseX: 0,
        mouseY: 0,
        targetMouseX: 0,
        targetMouseY: 0
    };

    window.addEventListener('pointermove', (e) => {
        STATE.targetMouseX = (e.clientX / window.innerWidth)  * 2 - 1;
        STATE.targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    // Pre-compute sidebar offset once; recalculate only on resize
    const SIDEBAR_WIDTH = 260;
    let visualCenterXPercent = ((SIDEBAR_WIDTH + (window.innerWidth - SIDEBAR_WIDTH) / 2) / window.innerWidth) * 100;
    window.addEventListener('resize', () => {
        visualCenterXPercent = ((SIDEBAR_WIDTH + (window.innerWidth - SIDEBAR_WIDTH) / 2) / window.innerWidth) * 100;
    }, { passive: true });

    function animate() {
        STATE.tick += 0.02;

        const damp = 0.08;
        STATE.mouseX += (STATE.targetMouseX - STATE.mouseX) * damp;
        STATE.mouseY += (STATE.targetMouseY - STATE.mouseY) * damp;

        const finalX    = visualCenterXPercent + STATE.mouseX * -12;
        const finalY    = 40 + STATE.mouseY * -12;
        const breathing = Math.sin(STATE.tick * 2.0) * 20;

        container.style.setProperty('--ring-radius',    STATE.radiusBase + breathing);
        container.style.setProperty('--ring-x',         finalX);
        container.style.setProperty('--ring-y',         finalY);
        container.style.setProperty('--animation-tick', STATE.tick);

        requestAnimationFrame(animate);
    }

    animate();
    console.log('Optimized Ripple Flow Particle Worklet initialized. Particles: ' + PARTICLE_COUNT);

} else {
    // Firefox / Safari fallback — static gradient from CSS is sufficient
    document.body.classList.add('no-paint-worklet');

    let container = document.getElementById('particle-bg');
    if (!container) {
        container = document.createElement('div');
        container.id = 'particle-bg';
        document.body.insertBefore(container, document.body.firstChild);
    }

    for (let i = 1; i <= 3; i++) {
        const orb = document.createElement('div');
        orb.className = `firefox-orb-${i}`;
        container.appendChild(orb);
    }

    console.log('Firefox fallback: Static gradient active.');
}
