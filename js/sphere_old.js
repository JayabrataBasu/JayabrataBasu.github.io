const techStackIcons = [
    { name: 'JavaScript', icon: '⚡' },
    { name: 'React', icon: '⚛️' },
    { name: 'Node.js', icon: '🟢' },
    { name: 'Python', icon: '🐍' },
    { name: 'TypeScript', icon: '📘' },
    { name: 'HTML5', icon: '🌐' },
    { name: 'CSS3', icon: '🎨' },
    { name: 'Git', icon: '📋' },
    { name: 'MySQL', icon: '🗄️' },
    { name: 'MongoDB', icon: '🍃' },
    { name: 'Java', icon: '☕' },
    { name: 'C++', icon: '⚙️' },
    { name: 'Django', icon: '🐍' },
    { name: 'Jupyter', icon: '📊' },
    { name: 'Linux', icon: '🐧' },
    { name: 'Docker', icon: '🐳' },
    { name: 'AWS', icon: '☁️' },
    { name: 'Firebase', icon: '🔥' }
];

class TagSphere {
    constructor(element, icons) {
        // Device pixel ratio handling
        this.dpr = Math.min(2, window.devicePixelRatio || 1);
        this.element = element;
        this.icons = icons;
        
        // Configuration
        this.radius = 230;
        this.maxSpeed = 0.1;
        this.initialSpeed = 0.01;
        this.mouseX = 0;
        this.mouseY = 0;
        
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
        
        this.icons.forEach((icon, index) => {
            const phi = Math.acos(-1 + (2 * index) / this.icons.length);
            const theta = Math.sqrt(this.icons.length * Math.PI) * phi;
            
            const sprite = this.createIconSprite(icon);
            sprite.position.setFromSphericalCoords(this.radius, phi, theta);
            
            // Round positions
            sprite.position.x = Math.round(sprite.position.x * 100) / 100;
            sprite.position.y = Math.round(sprite.position.y * 100) / 100;
            sprite.position.z = Math.round(sprite.position.z * 100) / 100;
            
            group.add(sprite);
        });
        
        this.scene.add(group);
        this.group = group;
    }
    
    updateRotation() {
        if (this.group) {
            const delta = 0.050; // Assuming 60fps
            this.group.rotation.x += (this.initialSpeed + (this.mouseY * 0.001)) * delta;
            this.group.rotation.y += (this.initialSpeed + (this.mouseX * 0.001)) * delta;
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateRotation();
        this.renderer.render(this.scene, this.camera);
    }
    
    onMouseMove(event) {
        const rect = this.element.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) - this.element.offsetWidth / 2) / 100;
        this.mouseY = ((event.clientY - rect.top) - this.element.offsetHeight / 2) / 100;
    }
    
    onResize() {
        const width = this.element.clientWidth;
        const height = this.element.clientHeight;
        
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
    if (container) {
        const sphere = new TagSphere(container, techStackIcons);
        
        document.addEventListener('mousemove', (e) => sphere.onMouseMove(e));
        window.addEventListener('resize', () => sphere.onResize());
        
        container.addEventListener('mouseenter', () => {
            sphere.initialSpeed = 0.03;
        });
        
        container.addEventListener('mouseleave', () => {
            sphere.initialSpeed = 0.01;
        });
    }
});
