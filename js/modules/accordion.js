// Аккордеон FAQ с плавной анимацией
export function initAccordion() {
  document.querySelectorAll('.accordion__item').forEach(item => {
    const header = item.querySelector('.accordion__header');
    const panel = item.querySelector('.accordion__panel');
    if (!header || !panel) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      item.classList.toggle('open', !isOpen);
      // Убираем hidden, используем только CSS для анимации
      if (!isOpen) {
        panel.hidden = false;
      } else {
        // Ждём окончания анимации перед скрытием
        setTimeout(() => {
          if (!item.classList.contains('open')) {
            panel.hidden = true;
          }
        }, 400);
      }
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

