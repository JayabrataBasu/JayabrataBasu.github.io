
    // This file can remain the same as the previous version.
// It's already modular and will work perfectly with the new structure.
document.addEventListener('DOMContentLoaded', () => {
    const sphereContainer = document.getElementById('sphere-container');
    if (!sphereContainer) return; // Only run if the sphere container exists on the page

    const skills = [
    { url: 'assets/icons/icons8-android-studio.svg', label: 'Android Studio' },
    { url: 'assets/icons/icons8-dart.svg', label: 'Dart' },
    { url: 'assets/icons/icons8-r-project.svg', label: 'R' },
    { url: 'assets/icons/icons8-tensorflow.svg', label: 'TensorFlow' },
    { url: 'assets/icons/icons8-c-programming.svg', label: 'C' },
    { url: 'assets/icons/rust-svgrepo-com.svg', label: 'Rust' },
    { url: 'assets/icons/c-plusplus.svg', label: 'C++' },
    { url: 'assets/icons/css-3.svg', label: 'CSS3' },
    { url: 'assets/icons/django-icon.svg', label: 'Django' },
    { url: 'assets/icons/git-icon.svg', label: 'Git' },
    { url: 'assets/icons/github-icon.svg', label: 'GitHub' },
    { url: 'assets/icons/html-5.svg', label: 'HTML5' },
    { url: 'assets/icons/intellij-idea.svg', label: 'IntelliJ IDEA' },
    { url: 'assets/icons/java.svg', label: 'Java' },
    { url: 'assets/icons/javascript.svg', label: 'JavaScript' },
    { url: 'assets/icons/jupyter.svg', label: 'Jupyter' },
    { url: 'assets/icons/kotlin-icon.svg', label: 'Kotlin' },
    { url: 'assets/icons/linux-mint.svg', label: 'Linux' },
    { url: 'assets/icons/mysql.svg', label: 'MySQL' },
    { url: 'assets/icons/postgresql.svg', label: 'PostgreSQL' },
    { url: 'assets/icons/pycharm.svg', label: 'PyCharm' },
    { url: 'assets/icons/python.svg', label: 'Python' },
    { url: 'assets/icons/pytorch-icon.svg', label: 'PyTorch' },
    { url: 'assets/icons/react.svg', label: 'React' },
    { url: 'assets/icons/tailwindcss-icon.svg', label: 'Tailwind CSS' },
    { url: 'assets/icons/typescript-icon.svg', label: 'TypeScript' },
    { url: 'assets/icons/visual-studio-code.svg', label: 'VS Code' },
    
    ];
    const wrapper = sphereContainer.querySelector('.sphere-wrapper');
    const tooltip = document.getElementById('tooltip');
    const iconElements = [];
    let radius = sphereContainer.offsetWidth / 2.5;
    let rotationX = 0, rotationY = 0, targetRotationX = 0.2, targetRotationY = 0.2;
    let isDragging = false, lastMouseX = 0, lastMouseY = 0;
    const EASE_FACTOR = 0.08;
    function createIcons() {
        const count = skills.length;
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        skills.forEach((skill, i) => {
            const y = 1 - (i / (count - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = (2 * Math.PI * goldenRatio) * i;
            const x = Math.cos(theta) * radiusAtY;
            const z = Math.sin(theta) * radiusAtY;
            const iconEl = document.createElement('div');
            iconEl.className = 'sphere-icon';
            const imgEl = document.createElement('img');
            imgEl.src = skill.url;
            imgEl.alt = skill.label;
            iconEl.appendChild(imgEl);
            wrapper.appendChild(iconEl);
            iconElements.push({ element: iconEl, x, y, z, label: skill.label });
        });
    }
    function updatePositions() {
        if (!isDragging) { targetRotationY += 0.0005; }
        rotationX += (targetRotationX - rotationX) * EASE_FACTOR;
        rotationY += (targetRotationY - rotationY) * EASE_FACTOR;
        const sinX = Math.sin(rotationX), cosX = Math.cos(rotationX);
        const sinY = Math.sin(rotationY), cosY = Math.cos(rotationY);
        iconElements.forEach(icon => {
            let x1 = icon.x * cosY - icon.z * sinY;
            let z1 = icon.x * sinY + icon.z * cosY;
            let y2 = icon.y * cosX - z1 * sinX;
            let z2 = icon.y * sinX + z1 * cosX;
            const scale = (z2 + 2) / 3;
            const transformX = x1 * radius;
            const transformY = y2 * radius;
            icon.element.style.transform = `translate(-50%, -50%) translate(${transformX}px, ${transformY}px) scale(${scale})`;
            icon.element.style.zIndex = Math.floor(100 + z2 * 100);
            icon.element.style.opacity = 0.5 + 0.5 * scale;
        });
        requestAnimationFrame(updatePositions);
    }
    function setupInteraction() {
        const stopDragging = () => { isDragging = false; };
        sphereContainer.addEventListener('mousedown', (e) => { isDragging = true; lastMouseX = e.clientX; lastMouseY = e.clientY; });
        window.addEventListener('mouseup', stopDragging);
        window.addEventListener('mouseleave', stopDragging);
        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const dx = e.clientX - lastMouseX;
                const dy = e.clientY - lastMouseY;
                targetRotationY += dx * 0.005;
                targetRotationX -= dy * 0.005;
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            }
        });
        wrapper.addEventListener('mouseover', (e) => {
            const target = e.target.closest('.sphere-icon');
            if (target) {
                const index = Array.from(wrapper.children).indexOf(target);
                tooltip.innerText = iconElements[index].label;
                tooltip.style.opacity = '1';
                tooltip.style.transform = 'scale(1)';
            }
        });
        wrapper.addEventListener('mousemove', (e) => { tooltip.style.left = `${e.clientX + 15}px`; tooltip.style.top = `${e.clientY}px`; });
        wrapper.addEventListener('mouseout', () => { tooltip.style.opacity = '0'; tooltip.style.transform = 'scale(0.9)'; });
    }
    function setupResponsiveness() {
        const observer = new ResizeObserver(() => {
            const newSize = Math.min(sphereContainer.offsetWidth, sphereContainer.offsetHeight);
            radius = newSize / 2.5;
        });
        observer.observe(sphereContainer);
    }
    createIcons();
    updatePositions();
    setupInteraction();
    setupResponsiveness();
});