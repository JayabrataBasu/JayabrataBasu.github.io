class TagSphere {
    constructor(element, icons) {
        this.element = element;
        this.icons = icons;
        
        // Configuration
        this.radius = 300;
        this.maxSpeed = 0.1;
        this.initialSpeed = 0.01;
        this.mouseX = 0;
        this.mouseY = 0;
        
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, element.offsetWidth / element.offsetHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        
        this.setupScene();
        this.createSphere();
        this.animate();
    }
    
    setupScene() {
        this.renderer.setSize(this.element.offsetWidth, this.element.offsetHeight);
        this.element.appendChild(this.renderer.domElement);
        this.camera.position.z = 500;
    }
    
    createSphere() {
        const group = new THREE.Group();
        
        this.icons.forEach((icon, index) => {
            const phi = Math.acos(-1 + (2 * index) / this.icons.length);
            const theta = Math.sqrt(this.icons.length * Math.PI) * phi;
            
            const sprite = this.createIconSprite(icon);
            sprite.position.setFromSphericalCoords(this.radius, phi, theta);
            
            group.add(sprite);
        });
        
        this.scene.add(group);
        this.group = group;
    }
    
    createIconSprite(iconPath) {
        const loader = new THREE.TextureLoader();
        const texture = loader.load(iconPath);
        const material = new THREE.SpriteMaterial({ 
            map: texture,
            transparent: true,
            opacity: 2.0
        });
        
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(60, 60, 1); // Adjust size of icons
        
        return sprite;
    }
    
    updateRotation() {
        if (this.group) {
            this.group.rotation.x += this.initialSpeed + (this.mouseY * 0.001);
            this.group.rotation.y += this.initialSpeed + (this.mouseX * 0.001);
        }
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateRotation();
        this.renderer.render(this.scene, this.camera);
    }
    
    onMouseMove(event) {
        this.mouseX = (event.clientX - window.innerWidth / 2) / 100;
        this.mouseY = (event.clientY - window.innerHeight / 2) / 100;
    }
    
    onResize() {
        this.camera.aspect = this.element.offsetWidth / this.element.offsetHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.element.offsetWidth, this.element.offsetHeight);
    }
}

// Tech stack icons array (replace with your icon paths)
const techStackIcons = [
    'assets/images/icons8-javascript.svg',
    'assets/images/icons8-android-studio.svg',
    'assets/images/icons8-java.svg',
    'assets/images/icons8-python.svg',
    'assets/images/icons8-c++.svg',
    'assets/images/icons8-kotlin.svg',
    'assets/images/icons8-css3.svg',
    'assets/images/icons8-html5.svg',
    'assets/images/icons8-arduino.svg',
    'assets/images/icons8-linux-mint.svg',
    'assets/images/icons8-pytorch.svg',
    'assets/images/icons8-intellij-idea.svg',
    'assets/images/icons8-c-programming.svg',
    'assets/images/icons8-virtualbox.svg',
    'assets/images/icons8-anaconda.svg'
];

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tech-sphere');
    if (container) {
        const sphere = new TagSphere(container, techStackIcons);
        
        document.addEventListener('mousemove', (e) => sphere.onMouseMove(e));
        window.addEventListener('resize', () => sphere.onResize());
        
        container.addEventListener('mouseenter', () => {
            sphere.initialSpeed = 0.003;
        });
        
        container.addEventListener('mouseleave', () => {
            sphere.initialSpeed = 0.01;
        });
    }
});
