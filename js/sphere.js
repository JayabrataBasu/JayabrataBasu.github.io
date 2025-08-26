// Map icons to human labels; ensure paths correspond to repository assets
const techStackIcons = [
    { path: 'assets/images/android-icon.svg', label: 'Android' },
    { path: 'assets/images/arduino.svg', label: 'Arduino' },
    { path: 'assets/images/c.svg', label: 'C' },
    { path: 'assets/images/c-plusplus.svg', label: 'C++' },
    { path: 'assets/images/css-3.svg', label: 'CSS3' },
    { path: 'assets/images/django-icon.svg', label: 'Django' },
    { path: 'assets/images/git-icon.svg', label: 'Git' },
    { path: 'assets/images/github-icon.svg', label: 'GitHub' },
    { path: 'assets/images/html-5.svg', label: 'HTML5' },
    { path: 'assets/images/intellij-idea.svg', label: 'IntelliJ IDEA' },
    { path: 'assets/images/java.svg', label: 'Java' },
    { path: 'assets/images/javascript.svg', label: 'JavaScript' },
    { path: 'assets/images/jupyter.svg', label: 'Jupyter' },
    { path: 'assets/images/kotlin-icon.svg', label: 'Kotlin' },
    { path: 'assets/images/linux-mint.svg', label: 'Linux' },
    { path: 'assets/images/mysql.svg', label: 'MySQL' },
    { path: 'assets/images/postgresql.svg', label: 'PostgreSQL' },
    { path: 'assets/images/pycharm.svg', label: 'PyCharm' },
    { path: 'assets/images/python.svg', label: 'Python' },
    { path: 'assets/images/pytorch-icon.svg', label: 'PyTorch' },
    { path: 'assets/images/react.svg', label: 'React' },
    { path: 'assets/images/tailwindcss-icon.svg', label: 'Tailwind CSS' },
    { path: 'assets/images/typescript-icon.svg', label: 'TypeScript' },
    { path: 'assets/images/visual-studio-code.svg', label: 'VS Code' }
];

class TagSphere {
    constructor(element, icons) {
        // Device pixel ratio handling
        this.dpr = Math.min(2, window.devicePixelRatio || 1);
        this.element = element;
        this.icons = icons;
        
        // Configuration
    this.radius = Math.min(230, Math.min(element.offsetWidth, element.offsetHeight) * 0.42);
    this.maxSpeed = 0.22;
    this.initialSpeed = 0.018;
        this.mouseX = 0;
        this.mouseY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.ease = 0.06;
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(65, element.offsetWidth / element.offsetHeight, 0.1, 1000);
        
        // Enhanced renderer configuration
        this.renderer = new THREE.WebGLRenderer({ 
            alpha: true, 
            antialias: true,
            powerPreference: "high-performance",
            precision: "highp"
        });
        
        this.renderer.setPixelRatio(this.dpr);
        
        this.setupScene();
        this.createSphere();
        this.animate();
    }
    
    setupScene() {
        const width = this.element.clientWidth * this.dpr;
        const height = this.element.clientHeight * this.dpr;
        this.renderer.setSize(width, height, false);
        this.element.appendChild(this.renderer.domElement);
        this.camera.position.z = 500;
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
        this.scene.add(ambientLight);
    }
    
    createIconSprite(iconPath) {
        const loader = new THREE.TextureLoader();
        
        const texture = loader.load(iconPath, (tex) => {
            tex.needsUpdate = true;
            tex.generateMipmaps = true;
        });
        
        // Optimal texture filtering
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        
        // Prevent texture wrapping
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.95,
            depthWrite: false,
            depthTest: true
        });
        
        const sprite = new THREE.Sprite(material);
        
        // Scale based on device pixel ratio
        const baseSize = 30;
        const scaledSize = baseSize * Math.pow(this.dpr, 0.85);
        sprite.scale.set(scaledSize, scaledSize, 1);
        
        return sprite;
    }
    
    createSphere() {
        const group = new THREE.Group();
        
        this.icons.forEach((iconObj, index) => {
            const phi = Math.acos(-1 + (2 * index) / this.icons.length);
            const theta = Math.sqrt(this.icons.length * Math.PI) * phi;

            const sprite = this.createIconSprite(iconObj.path);
            sprite.userData.label = iconObj.label;
            sprite.position.setFromSphericalCoords(this.radius, phi, theta);
            
            // Round positions
            sprite.position.x = Math.round(sprite.position.x * 100) / 100;
            sprite.position.y = Math.round(sprite.position.y * 100) / 100;
            sprite.position.z = Math.round(sprite.position.z * 100) / 100;
            
            group.add(sprite);
        });
        
        this.scene.add(group);
        this.group = group;
        // Raycaster for hover
        this.raycaster = new THREE.Raycaster();
        this.pointer = new THREE.Vector2();
        this.hovered = null;
    }
    
    updateRotation() {
        if (this.group) {
            const base = this.initialSpeed;
            // Smooth easing toward mouse-driven target rotation
            this.targetRotX += (this.mouseY * 0.0099);
            this.targetRotY += (this.mouseX * 0.0099);
            this.targetRotX = Math.max(-1.2, Math.min(1.2, this.targetRotX));
            this.targetRotY = Math.max(-1.2, Math.min(1.2, this.targetRotY));
            this.group.rotation.x += (base + this.targetRotX - this.group.rotation.x) * this.ease;
            this.group.rotation.y += (base + this.targetRotY - this.group.rotation.y) * this.ease;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateRotation();
        this.updateHover();
        this.renderer.render(this.scene, this.camera);
    }

    updateHover() {
        if (!this.group) return;
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.group.children, false);
        if (intersects.length > 0) {
            const first = intersects[0].object;
            if (this.hovered !== first) {
                if (this.hovered) this.hovered.material.opacity = 0.95;
                this.hovered = first;
                this.hovered.material.opacity = 1;
                if (window.__showSkillTooltip) window.__showSkillTooltip(first.userData.label);
            }
        } else if (this.hovered) {
            this.hovered.material.opacity = 0.95;
            this.hovered = null;
            if (window.__hideSkillTooltip) window.__hideSkillTooltip();
        }
    }
    
    onMouseMove(event) {
        const rect = this.element.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) - this.element.offsetWidth / 2) / 100;
        this.mouseY = ((event.clientY - rect.top) - this.element.offsetHeight / 2) / 100;
        this.pointer.x = ((event.clientX - rect.left) / this.element.offsetWidth) * 2 - 1;
        this.pointer.y = - ((event.clientY - rect.top) / this.element.offsetHeight) * 2 + 1;
    }
    
    onResize() {
        const width = this.element.clientWidth;
        const height = this.element.clientHeight;
        this.radius = Math.min(230, Math.min(width, height) * 0.42);
        // Reposition icons on resize to maintain sphere quality
        if (this.group) {
            this.group.children.forEach((sprite, index) => {
                const phi = Math.acos(-1 + (2 * index) / this.icons.length);
                const theta = Math.sqrt(this.icons.length * Math.PI) * phi;
                sprite.position.setFromSphericalCoords(this.radius, phi, theta);
            });
        }
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width * this.dpr, height * this.dpr, false);
        this.renderer.domElement.style.width = width + 'px';
        this.renderer.domElement.style.height = height + 'px';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tech-sphere');
    if (!container) return;
    const sphere = new TagSphere(container, techStackIcons);
    document.addEventListener('mousemove', e => sphere.onMouseMove(e));
    window.addEventListener('resize', () => sphere.onResize());
    container.addEventListener('mouseenter', () => { sphere.initialSpeed = 0.03; });
    container.addEventListener('mouseleave', () => { sphere.initialSpeed = 0.01; if (window.__hideSkillTooltip) window.__hideSkillTooltip(); });
});
