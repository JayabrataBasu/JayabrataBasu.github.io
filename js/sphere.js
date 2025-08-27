// Interactive SVG Icon Sphere (Three.js) - Sharp Version
// Usage: Place <div id="tech-sphere"></div> in HTML, ensure THREE.js is loaded, and icons array below is correct.

const techStackIcons = [
        { url: 'assets/images/android-icon.svg', label: 'Android' },
        { url: 'assets/images/arduino.svg', label: 'Arduino' },
        { url: 'assets/images/c.svg', label: 'C' },
        { url: 'assets/images/c-plusplus.svg', label: 'C++' },
        { url: 'assets/images/css-3.svg', label: 'CSS3' },
        { url: 'assets/images/django-icon.svg', label: 'Django' },
        { url: 'assets/images/git-icon.svg', label: 'Git' },
        { url: 'assets/images/github-icon.svg', label: 'GitHub' },
        { url: 'assets/images/html-5.svg', label: 'HTML5' },
        { url: 'assets/images/intellij-idea.svg', label: 'IntelliJ IDEA' },
        { url: 'assets/images/java.svg', label: 'Java' },
        { url: 'assets/images/javascript.svg', label: 'JavaScript' },
        { url: 'assets/images/jupyter.svg', label: 'Jupyter' },
        { url: 'assets/images/kotlin-icon.svg', label: 'Kotlin' },
        { url: 'assets/images/linux-mint.svg', label: 'Linux' },
        { url: 'assets/images/mysql.svg', label: 'MySQL' },
        { url: 'assets/images/postgresql.svg', label: 'PostgreSQL' },
        { url: 'assets/images/pycharm.svg', label: 'PyCharm' },
        { url: 'assets/images/python.svg', label: 'Python' },
        { url: 'assets/images/pytorch-icon.svg', label: 'PyTorch' },
        { url: 'assets/images/react.svg', label: 'React' },
        { url: 'assets/images/tailwindcss-icon.svg', label: 'Tailwind CSS' },
        { url: 'assets/images/typescript-icon.svg', label: 'TypeScript' },
        { url: 'assets/images/visual-studio-code.svg', label: 'VS Code' }
];

function createIconSphere(containerSelector, icons, options = {}) {
    // Auto-detect Windows low-DPR environment for DOM fallback (crisper SVG) unless user forces WebGL
    const dpr = window.devicePixelRatio || 1;
    const isWindows = /windows/i.test(navigator.userAgent);
    const preferDom = options.mode === 'dom' || (options.mode !== 'webgl' && isWindows && dpr <= 1.25);
    if (preferDom) {
        return createIconSphereDOM(containerSelector, icons, options);
    }
    // --- Configurable parameters ---
    const BASE_ICON_SIZE = 52; // slight bump for clarity
    const SPHERE_MARGIN = 0.11;
    const HOVER_SCALE = 1.22;
    const IDLE_ROT_SPEED = 2.93;
    const EASE = 0.9;

    // High-DPI texture settings (oversample & mipmaps)
    const DPR = window.devicePixelRatio || 1;
    const QUALITY_MULT = 3; // oversample factor
    const RAW_TEXTURE = BASE_ICON_SIZE * DPR * QUALITY_MULT;
    const TEXTURE_SIZE = Math.pow(2, Math.ceil(Math.log2(RAW_TEXTURE))); // nearest power of two

    // --- Setup scene, camera, renderer ---
    const container = typeof containerSelector === 'string'
        ? document.querySelector(containerSelector)
        : containerSelector;
    if (!container) throw new Error('Icon sphere container not found');

    // Remove previous canvas if any
    while (container.firstChild) container.removeChild(container.firstChild);

    const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(DPR);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, 1, 0.1, 1000);

    // --- Lighting ---
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));
    const pointLight = new THREE.PointLight(0xffffff, 0.6, 0);
    pointLight.position.set(0, 0, 400);
    scene.add(pointLight);

    // --- Sphere group ---
    const group = new THREE.Group();
    scene.add(group);

    // --- Responsive sizing ---
    let radius = 200, cameraZ = 400;
    function resize() {
        const w = container.offsetWidth, h = container.offsetHeight;
        const minDim = Math.min(w, h);
        radius = 0.5 * minDim * (1 - SPHERE_MARGIN);
        cameraZ = radius * 2.2;
        camera.aspect = w / h;
        camera.position.z = cameraZ;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
        // Reposition & rescale icons (accurate FOV math + pixel snapping)
        const fovRad = camera.fov * Math.PI / 180;
        group.children.forEach((sprite, i) => {
            const phi = Math.acos(-1 + (2 * i) / icons.length);
            const theta = Math.sqrt(icons.length * Math.PI) * phi;
            sprite.position.setFromSphericalCoords(radius, phi, theta);
            const distance = sprite.position.distanceTo(camera.position);
            const worldPerPixel = (2 * distance * Math.tan(fovRad / 2)) / renderer.domElement.height;
            const worldSize = BASE_ICON_SIZE * worldPerPixel;
            const snapped = Math.round(worldSize * DPR) / DPR;
            sprite.scale.set(snapped, snapped, 1);
        });
        // Ensure canvas is not scaled by CSS
        renderer.domElement.style.width = w + 'px';
        renderer.domElement.style.height = h + 'px';
    }
    window.addEventListener('resize', resize);

    // --- Robust SVG to Canvas Texture ---
    function svgToTexture(svgUrl, size, cb) {
        // First try to load SVG directly as image (simpler approach)
        const img = new window.Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            // Create high-resolution canvas
            const canvas = document.createElement('canvas');
            const finalSize = size; // already includes DPR & quality
            canvas.width = canvas.height = finalSize;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.clearRect(0, 0, finalSize, finalSize);
            ctx.drawImage(img, 0, 0, finalSize, finalSize);
            // Create texture
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true;
            texture.generateMipmaps = true;
            texture.magFilter = THREE.LinearFilter;
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
            cb(texture);
        };
        
        img.onerror = () => {
            console.warn(`Direct load failed for ${svgUrl}, trying fetch method...`);
            
            // Fallback: fetch and parse SVG
            fetch(svgUrl)
                .then(r => r.text())
                .then(svgText => {
                    // Basic SVG cleanup
                    if (!/xmlns/.test(svgText)) {
                        svgText = svgText.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
                    }
                    
                    // Ensure viewBox exists
                    if (!/viewBox=/.test(svgText)) {
                        svgText = svgText.replace(
                            /<svg([^>]*)>/,
                            `<svg$1 viewBox="0 0 100 100">`
                        );
                    }
                    
                    // Create blob URL
                    const svg = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
                    const url = URL.createObjectURL(svg);
                    
                    const fallbackImg = new window.Image();
                    fallbackImg.onload = () => {
                        const canvas = document.createElement('canvas');
                        const finalSize = size; // already baked resolution
                        canvas.width = canvas.height = finalSize;
                        
                        const ctx = canvas.getContext('2d');
                        ctx.imageSmoothingEnabled = true;
                        ctx.imageSmoothingQuality = 'high';
                        ctx.clearRect(0, 0, finalSize, finalSize);
                        ctx.drawImage(fallbackImg, 0, 0, finalSize, finalSize);
                        
                        const texture = new THREE.Texture(canvas);
                        texture.needsUpdate = true;
                        texture.generateMipmaps = true;
                        texture.magFilter = THREE.LinearFilter;
                        texture.minFilter = THREE.LinearMipmapLinearFilter;
                        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                        
                        URL.revokeObjectURL(url);
                        cb(texture);
                    };
                    
                    fallbackImg.onerror = () => {
                        console.error(`Failed to load SVG: ${svgUrl}`);
                        URL.revokeObjectURL(url);
                        cb(null);
                    };
                    
                    fallbackImg.src = url;
                })
                .catch(err => {
                    console.error(`Failed to fetch SVG: ${svgUrl}`, err);
                    cb(null);
                });
        };
        
        // Try direct load first
        img.src = svgUrl;
    }

    // --- Create icon sprites ---
    icons.forEach((icon, i) => {
        // Create sprite with pixel-perfect material
        const mat = new THREE.SpriteMaterial({ 
            color: 0xffffff, 
            opacity: 0.0,
            transparent: true,
            alphaTest: 0.1, // Higher alpha test for cleaner edges
            depthTest: false, // Disable depth testing for sprites
            depthWrite: false
        });
        const sprite = new THREE.Sprite(mat);
        sprite.userData = { label: icon.label, url: icon.url, i, originalScale: BASE_ICON_SIZE };
        
        // Place on sphere
        const phi = Math.acos(-1 + (2 * i) / icons.length);
        const theta = Math.sqrt(icons.length * Math.PI) * phi;
        sprite.position.setFromSphericalCoords(radius, phi, theta);

        // Load SVG as texture with better error handling
        svgToTexture(icon.url, TEXTURE_SIZE, tex => {
            if (tex) {
                mat.map = tex;
                mat.opacity = 0.9;
                mat.transparent = true;
                mat.needsUpdate = true;
                console.log(`Successfully loaded: ${icon.label}`);
            } else {
                console.error(`Failed to load texture for: ${icon.label}`);
                // Create a fallback colored square
                const canvas = document.createElement('canvas');
                canvas.width = canvas.height = 64;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#666';
                ctx.fillRect(0, 0, 64, 64);
                ctx.fillStyle = 'white';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(icon.label.substring(0, 2), 32, 38);
                
                const fallbackTexture = new THREE.Texture(canvas);
                fallbackTexture.needsUpdate = true;
                mat.map = fallbackTexture;
                mat.opacity = 0.7;
                mat.needsUpdate = true;
            }
        });

        group.add(sprite);
    });

    // --- Mouse interaction state ---
    let mouseX = 0, mouseY = 0, targetRotX = 0, targetRotY = 0;
    // Drift state
    let driftAngle = Math.random() * Math.PI * 2;
    let driftSpeed = 0.002 + Math.random() * 0.002;
    let driftDX = Math.cos(driftAngle) * driftSpeed;
    let driftDY = Math.sin(driftAngle) * driftSpeed;
    let driftTimer = 0;
    let hovered = null;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    // --- Mouse move handler ---
    function onMouseMove(e) {
        const rect = container.getBoundingClientRect();
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    }
    container.addEventListener('mousemove', onMouseMove);

    // --- Animation loop ---
    function animate() {
        requestAnimationFrame(animate);

        // Smooth random drift
        driftTimer += 1;
        if (driftTimer % 180 === 0) { // every ~3s, change drift direction slightly
            driftAngle += (Math.random() - 0.5) * 0.7;
            driftSpeed = 0.0015 + Math.random() * 0.0025;
            driftDX = Math.cos(driftAngle) * driftSpeed;
            driftDY = Math.sin(driftAngle) * driftSpeed;
        }
        targetRotX += driftDX;
        targetRotY += driftDY;
        // Mouse influence
        targetRotX += (mouseY * 3.1 - targetRotX) * EASE * 0.5;
        targetRotY += (mouseX * 3.1 - targetRotY) * EASE * 0.5;
        group.rotation.x += (targetRotX - group.rotation.x) * EASE + IDLE_ROT_SPEED;
        group.rotation.y += (targetRotY - group.rotation.y) * EASE + IDLE_ROT_SPEED;

        // Hover detection with improved scaling
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(group.children, false);
        
        if (intersects.length > 0) {
            const sprite = intersects[0].object;
            if (hovered !== sprite) {
                // Reset previous hover
                if (hovered) {
                    const distance = hovered.position.distanceTo(camera.position);
                    const worldSize = (hovered.userData.originalScale * distance) / (camera.fov * Math.PI / 180 * renderer.domElement.height);
                    hovered.scale.set(worldSize, worldSize, 1);
                    hovered.material.opacity = 0.95;
                }
                
                // Apply hover effect
                hovered = sprite;
                const distance = sprite.position.distanceTo(camera.position);
                const worldSize = (sprite.userData.originalScale * HOVER_SCALE * distance) / (camera.fov * Math.PI / 180 * renderer.domElement.height);
                sprite.scale.set(worldSize, worldSize, 1);
                sprite.material.opacity = 1.0;
                
                if (window.__showSkillTooltip) window.__showSkillTooltip(sprite.userData.label);
            }
        } else if (hovered) {
            // Reset hover
            const distance = hovered.position.distanceTo(camera.position);
            const worldSize = (hovered.userData.originalScale * distance) / (camera.fov * Math.PI / 180 * renderer.domElement.height);
            hovered.scale.set(worldSize, worldSize, 1);
            hovered.material.opacity = 0.95;
            
            if (window.__hideSkillTooltip) window.__hideSkillTooltip();
            hovered = null;
        }

        renderer.render(scene, camera);
    }

    // --- Initialize ---
    resize();
    animate();

    // --- Public API ---
    return {
        scene, camera, renderer, group,
        resize,
        destroy() {
            window.removeEventListener('resize', resize);
            container.removeEventListener('mousemove', onMouseMove);
            renderer.dispose();
            while (container.firstChild) container.removeChild(container.firstChild);
        }
    };
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tech-sphere');
    if (!container) return;
    createIconSphere(container, techStackIcons);
});

// -------- DOM (CSS 3D / Perspective) Fallback for Razor-Sharp SVGs ---------
function createIconSphereDOM(containerSelector, icons, options = {}) {
    const container = typeof containerSelector === 'string'
        ? document.querySelector(containerSelector)
        : containerSelector;
    if (!container) throw new Error('Icon sphere container not found');

    // Clear existing
    while (container.firstChild) container.removeChild(container.firstChild);
    container.classList.add('sphere-dom');

    const BASE_ICON = options.baseIconSize || 52;
    const HOVER_SCALE = 1.22;
    const IDLE_ROT_SPEED = 0.099; // base
    const DRIFT_VARIATION = (Math.random()*0.004)+0.015; // slow global drift
    const EASE = 0.09;
    const SPHERE_MARGIN = 0.08;
    const DEPTH_FADE = true;
    const perspective = 900; // px

    // Wrapper for positioning
    const wrapper = document.createElement('div');
    wrapper.className = 'sphere-dom-wrapper';
    container.appendChild(wrapper);

    let width = container.offsetWidth;
    let height = container.offsetHeight;
    let radius = 0.5 * Math.min(width, height) * (1 - SPHERE_MARGIN);

    // Generate spherical distribution (Fibonacci lattice)
    const nodes = icons.map((icon, i) => {
        const phi = Math.acos(1 - 2 * (i + 0.5) / icons.length);
        const theta = Math.PI * (1 + Math.sqrt(5)) * (i + 0.5);
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.cos(phi);
        const z = Math.sin(phi) * Math.sin(theta);
        const el = document.createElement('div');
        el.className = 'sphere-icon';
        el.setAttribute('data-label', icon.label);
        const img = document.createElement('img');
        img.src = icon.url;
        img.alt = icon.label;
        img.decoding = 'async';
        img.loading = 'lazy';
        el.appendChild(img);
        wrapper.appendChild(el);
        return { phi, theta, x, y, z, el };
    });

    // Interaction state
    let rotX = 0;
    let rotY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    // Drift state
    let driftAngle = Math.random() * Math.PI * 2;
    let driftSpeed = 0.002 + Math.random() * 0.002;
    let driftDX = Math.cos(driftAngle) * driftSpeed;
    let driftDY = Math.sin(driftAngle) * driftSpeed;
    let driftTimer = 0;
    let mouseActive = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let hovered = null;

    function resize() {
        width = container.offsetWidth;
        height = container.offsetHeight;
        radius = 0.5 * Math.min(width, height) * (1 - SPHERE_MARGIN);
    }
    window.addEventListener('resize', resize);

    function onPointerDown(e) {
        mouseActive = true;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;
    }
    function onPointerUp() { mouseActive = false; }
    function onPointerMove(e) {
        if (mouseActive) {
            const dx = e.clientX - lastPointerX;
            const dy = e.clientY - lastPointerY;
            lastPointerX = e.clientX;
            lastPointerY = e.clientY;
            targetRotY += dx * 0.003;
            targetRotX += dy * 0.003;
        } else {
            // Passive pointer influences target gently
            const rect = container.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width - 0.5;
            const my = (e.clientY - rect.top) / rect.height - 0.5;
            targetRotY = mx * 0.9;
            targetRotX = my * 0.9;
        }
    }
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);
    container.addEventListener('pointerleave', () => { mouseActive = false; });
    container.addEventListener('pointermove', onPointerMove);

    // Hover tooltips
    container.addEventListener('pointermove', e => {
        const el = e.target.closest('.sphere-icon');
        if (el !== hovered) {
            if (hovered) hovered.classList.remove('hover');
            hovered = el;
            if (hovered) {
                hovered.classList.add('hover');
                if (window.__showSkillTooltip) window.__showSkillTooltip(hovered.dataset.label);
            } else if (window.__hideSkillTooltip) window.__hideSkillTooltip();
        }
    });

    function projectAndRender() {
        // Ease rotation
    // Smooth random drift
    driftTimer += 1;
    if (driftTimer % 180 === 0) { // every ~3s, change drift direction slightly
        driftAngle += (Math.random() - 0.5) * 0.7;
        driftSpeed = 0.0015 + Math.random() * 0.0025;
        driftDX = Math.cos(driftAngle) * driftSpeed;
        driftDY = Math.sin(driftAngle) * driftSpeed;
    }
    targetRotX += driftDX;
    targetRotY += driftDY;
    // Mouse influence
    rotX += (targetRotX - rotX) * EASE + IDLE_ROT_SPEED + DRIFT_VARIATION*0.2;
    rotY += (targetRotY - rotY) * EASE + IDLE_ROT_SPEED + DRIFT_VARIATION;

        const sinX = Math.sin(rotX), cosX = Math.cos(rotX);
        const sinY = Math.sin(rotY), cosY = Math.cos(rotY);

        nodes.forEach(n => {
            // Rotate original unit vector (n.x,n.y,n.z) by rotX (X axis) then rotY (Y axis)
            // Apply Y rotation
            let x1 = n.x * cosY + n.z * sinY;
            let z1 = -n.x * sinY + n.z * cosY;
            // Apply X rotation
            let y2 = n.y * cosX - z1 * sinX;
            let z2 = n.y * sinX + z1 * cosX;
            const scale = perspective / (perspective - z2 * radius);
            const screenX = x1 * radius * scale + width / 2;
            const screenY = y2 * radius * scale + height / 2;
            const size = BASE_ICON * scale;
            const el = n.el;
            el.style.transform = `translate(${screenX}px,${screenY}px) translate(-50%,-50%) scale(${scale})`;
            el.style.zIndex = (1000 + (z2 * 1000)) | 0;
            if (DEPTH_FADE) {
                const alpha = 0.45 + 0.55 * (z2 * 0.5 + 0.5); // 0.45 - 1.0
                el.style.opacity = alpha.toFixed(3);
            }
            // Focus state scale handled via CSS class
        });
        requestAnimationFrame(projectAndRender);
    }
    projectAndRender();

    return {
        mode: 'dom',
        destroy() {
            window.removeEventListener('resize', resize);
            container.removeEventListener('pointerdown', onPointerDown);
            window.removeEventListener('pointerup', onPointerUp);
            container.removeEventListener('pointermove', onPointerMove);
            while (container.firstChild) container.removeChild(container.firstChild);
        }
    };
}