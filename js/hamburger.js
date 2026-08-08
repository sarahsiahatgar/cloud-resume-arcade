// js/hamburger.js

export function initHamburger() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const navLinks = document.getElementById('navLinks');
  const closeMenuBtn = document.getElementById('closeMenuBtn');

  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      navLinks.classList.toggle('active');
    });

    if (closeMenuBtn) {
      closeMenuBtn.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    }

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });

    document.addEventListener('click', (event) => {
      const isClickInsideNav = navLinks.contains(event.target);
      const isClickOnHamburger = hamburgerBtn.contains(event.target);

      if (!isClickInsideNav && !isClickOnHamburger && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
      }
    });
  }
}