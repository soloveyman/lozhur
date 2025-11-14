// Валидация полей формы
export const normalizePhone = (v) => v.replace(/[^\d+]/g, '');

export const isFioValid = (v) => {
  const s = v.trim();
  if (s.length < 6) return false;
  return /^[A-Za-zА-Яа-яЁё\-\s]+$/.test(s);
};

export const isPhoneValid = (v) => /^\+375\d{9}$/.test(normalizePhone(v));

export const isExpValid = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && n >= 2;
};

export function setFieldState(box, state) {
  box.classList.remove('is-focus', 'is-valid', 'is-error');
  if (state === 'focus') box.classList.add('is-focus');
  if (state === 'valid') box.classList.add('is-valid');
  if (state === 'error') box.classList.add('is-error');
}

