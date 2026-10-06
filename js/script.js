const navButtons = document.querySelectorAll('.nav__button');
const sections = document.querySelectorAll('.section');

function showSection(sectionId) {
    sections.forEach(section => {
        section.style.display = 'none';
        
        if (section.id === sectionId) {
            section.style.display = 'block';
        }
    });
}

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        showSection(button.id);
    });
});