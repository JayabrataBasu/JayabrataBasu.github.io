document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section[data-theme]');
    const body = document.body;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const theme = entry.target.getAttribute('data-theme');
                body.setAttribute('data-theme', theme);
            }
        });
    }, {
        threshold: 0.5 // Change theme when 50% of the section is visible
    });

    sections.forEach(section => {
        observer.observe(section);
    });
});