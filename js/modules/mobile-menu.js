// Мобильное меню (бургер)
export function initMobileMenu() {
  const burgerBtn = document.querySelector('.burger-btn');
  const nav = document.querySelector('.header__nav');
  if (!burgerBtn || !nav) return;

  burgerBtn.addEventListener('click', () => {
    const isOpen = burgerBtn.getAttribute('aria-expanded') === 'true';
    burgerBtn.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open');
    document.body.classList.toggle('menu-open');
  });

  // Закрытие при клике на ссылку
  const navLinks = nav.querySelectorAll('.menu-btn');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burgerBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    });
  });

  // Закрытие при клике вне меню
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('is-open') && 
        !nav.contains(e.target) && 
        !burgerBtn.contains(e.target)) {
      burgerBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('is-open');
      document.body.classList.remove('menu-open');
    }
  });
}

