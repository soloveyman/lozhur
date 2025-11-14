// Анимация иконки при клике на кнопку
export function initButtonAnimation() {
  document.querySelectorAll('.btn .btn-icon').forEach(iconWrapper => {
    const button = iconWrapper.closest('.btn');
    if (!button) return;

    button.addEventListener('click', () => {
      button.classList.add('is-clicked');
      // Убираем класс после анимации
      setTimeout(() => {
        button.classList.remove('is-clicked');
      }, 300);
    });
  });
}

