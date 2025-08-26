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
        this.element = element;
        this.icons = icons;
        this.radius = 200;
        this.mouseX = 0;
        this.mouseY = 0;
        this.rotationX = 0;
        this.rotationY = 0;
        this.autoRotate = true;
        
        this.createElement();
        this.positionIcons();
        this.addEventListeners();
        this.animate();
    }
    
    createElement() {
        this.sphere = document.createElement('div');
        this.sphere.className = 'sphere-container';
        this.sphere.style.cssText = `
            position: relative;
            width: ${this.radius * 2}px;
            height: ${this.radius * 2}px;
            transform-style: preserve-3d;
            transition: transform 0.1s ease-out;
        `;
        
        this.element.appendChild(this.sphere);
    }
    
    positionIcons() {
        this.icons.forEach((iconData, i) => {
            const iconElement = document.createElement('div');
            iconElement.className = 'sphere-icon';
            iconElement.innerHTML = `
                <span class="icon">${iconData.icon}</span>
                <span class="label">${iconData.name}</span>
            `;
            
            // Calculate spherical coordinates
            const phi = Math.acos(-1 + (2 * i) / this.icons.length);
            const theta = Math.sqrt(this.icons.length * Math.PI) * phi;
            
            const x = this.radius * Math.cos(theta) * Math.sin(phi);
            const y = this.radius * Math.sin(theta) * Math.sin(phi);
            const z = this.radius * Math.cos(phi);
            
            iconElement.style.cssText = `
                position: absolute;
                left: 50%;
                top: 50%;
                width: 60px;
                height: 60px;
                margin: -30px 0 0 -30px;
                transform: translate3d(${x}px, ${y}px, ${z}px);
                transition: all 0.3s ease;
                cursor: pointer;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                background: rgba(255, 107, 107, 0.1);
                border: 1px solid rgba(255, 107, 107, 0.3);
                border-radius: 50%;
                backdrop-filter: blur(10px);
            `;
            
            iconElement.querySelector('.icon').style.cssText = `
                font-size: 24px;
                margin-bottom: 2px;
            `;
            
            iconElement.querySelector('.label').style.cssText = `
                font-size: 8px;
                color: var(--white);
                font-family: var(--font-mono);
                opacity: 0;
                transition: opacity 0.3s ease;
                text-align: center;
                white-space: nowrap;
            `;
            
            iconElement.addEventListener('mouseenter', () => {
                iconElement.style.transform += ' scale(1.2)';
                iconElement.style.background = 'rgba(255, 107, 107, 0.2)';
                iconElement.style.boxShadow = '0 0 20px rgba(255, 107, 107, 0.5)';
                iconElement.querySelector('.label').style.opacity = '1';
            });
            
            iconElement.addEventListener('mouseleave', () => {
                iconElement.style.transform = iconElement.style.transform.replace(' scale(1.2)', '');
                iconElement.style.background = 'rgba(255, 107, 107, 0.1)';
                iconElement.style.boxShadow = 'none';
                iconElement.querySelector('.label').style.opacity = '0';
            });
            
            this.sphere.appendChild(iconElement);
        });
    }
    
    addEventListeners() {
        this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.element.addEventListener('mouseenter', () => this.autoRotate = false);
        this.element.addEventListener('mouseleave', () => this.autoRotate = true);
    }
    
    onMouseMove(event) {
        const rect = this.element.getBoundingClientRect();
        this.mouseX = ((event.clientX - rect.left) - this.element.offsetWidth / 2) / 200;
        this.mouseY = ((event.clientY - rect.top) - this.element.offsetHeight / 2) / 200;
    }
    
    animate() {
        if (this.autoRotate) {
            this.rotationY += 0.005;
        } else {
            this.rotationY += this.mouseX * 0.02;
            this.rotationX += this.mouseY * 0.02;
        }
        
        this.sphere.style.transform = `rotateX(${this.rotationX}rad) rotateY(${this.rotationY}rad)`;
        
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tech-sphere');
    if (container) {
        const sphere = new TagSphere(container, techStackIcons);
    }
});