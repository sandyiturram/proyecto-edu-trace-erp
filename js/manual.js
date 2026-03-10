document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    // Navigation Logic
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update Nav
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update Sections
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });
    });

    // Image Zoom Logic (Simple)
    const screenshots = document.querySelectorAll('.screenshot-container img');
    screenshots.forEach(img => {
        img.addEventListener('click', () => {
            // In a full implementation, we'd open a lightbox. 
            // For now, let's just toggle a native full-screen or similar effect
            if (img.style.transform === 'scale(1.5)') {
                img.style.transform = 'scale(1)';
                img.style.zIndex = '1';
                img.style.position = 'relative';
            } else {
                img.style.transform = 'scale(1.5)';
                img.style.zIndex = '1000';
                img.style.position = 'relative';
                img.style.transition = 'transform 0.3s ease';
            }
        });
    });
});
