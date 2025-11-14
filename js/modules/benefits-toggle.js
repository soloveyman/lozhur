// Переключатель секции benefits
export function initBenefitsToggle() {
  const toggle = document.getElementById('benefitsToggle');
  const labels = document.querySelectorAll('.benefits__toggle-label');
  const cards = document.querySelectorAll('.benefits-card');

  if (!toggle || labels.length === 0 || cards.length === 0) return;

  let isDrivers = true;

  function switchCards(target) {
    isDrivers = target === 'drivers';

    // Обновляем переключатель (active = водители, не active = партнёры)
    toggle.classList.add('active');
    if (isDrivers) {
      toggle.classList.remove('benefits__toggle-switch--partners');
    } else {
      toggle.classList.add('benefits__toggle-switch--partners');
    }

    // Обновляем метки
    labels.forEach(label => {
      const isActive = label.dataset.target === target;
      label.classList.toggle('active', isActive);
    });

    // Переключаем карточки
    cards.forEach(card => {
      const isDriversCard = card.classList.contains('benefits-card--drivers');
      const shouldShow = (isDrivers && isDriversCard) || (!isDrivers && !isDriversCard);
      card.classList.toggle('active', shouldShow);
    });
  }

  // Обработчики кликов на метки
  labels.forEach(label => {
    label.addEventListener('click', () => {
      const target = label.dataset.target;
      switchCards(target);
    });
  });

  // Обработчик клика на переключатель
  toggle.addEventListener('click', () => {
    const target = isDrivers ? 'partners' : 'drivers';
    switchCards(target);
  });
}

