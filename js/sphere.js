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
    
        // Ensure crisp rendering
        texture.minFilter = THREE.NearestFilter;
        texture.magFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 1.0, // Full opacity for vibrant colors
        });
    
        const sprite = new THREE.Sprite(material);
    
        // Adjust icon size (scale) to match the desired look
        sprite.scale.set(50, 50, 1); // Adjust size as needed
    
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
    'assets/images/repo-com.svg',
    'assets/images/android-studio.svg',
    'assets/images/java.svg',
    'assets/images/python.svg',
    'assets/images/cplusplus.svg',
    'assets/images/kotlin-icon.svg',
    'assets/images/css-3.svg',
    'assets/images/html-5.svg',
    'assets/images/arduino.svg',
    'assets/images/linux-mint.svg',
    'assets/images/pytorch-icon.svg',
    'assets/images/pycharm.svg',  // Assuming this is for IntelliJ IDEA, correct if needed
    'assets/images/c.svg',  // C programming, correct if needed
    'assets/images/visual-studio-code.svg',  // Assuming this replaces VirtualBox
    'assets/images/conda.svg', // Assuming this replaces Anaconda
    'assests/images/intellij-idea.svg',
    'assets/images/postgresql.svg',
    'assets/images/mysql.svg',
    'assets/images/django.svg',
    'assets/images/jupyter.svg',
    'assets/images/git-icon.svg',
    'assets/images/github-icon.svg',
    'assets/images/typescript-icon.svg',
    'assets/images/javascript.svg',
    'assets/images/react.svg',
    'assets/images/tailwindcss-icon.svg',
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

techStackIcons.forEach(tech => {
    const img = document.createElement('img');
    img.src = tech.icon;
    img.alt = tech.name;
    img.style.width = '60px'; // Set a fixed width
    img.style.height = '60px'; // Set a fixed height
    img.style.imageRendering = 'crisp-edges'; // Ensure crisp rendering
    document.getElementById('tech-stack').appendChild(img);
});