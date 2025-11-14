// Обработчик формы с валидацией и отправкой
import { isFioValid, isPhoneValid, isExpValid, setFieldState } from './form-validation.js';
import { submitForm } from './form-submit.js';

export function initFormHandler() {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const fields = {
    fio: form.querySelector('#fio'),
    phone: form.querySelector('#phone'),
    exp: form.querySelector('#exp'),
  };

  const boxes = {
    fio: fields.fio?.closest('.form-field'),
    phone: fields.phone?.closest('.form-field'),
    exp: fields.exp?.closest('.form-field'),
  };

  const note = document.getElementById('formNote');
  const btn = document.getElementById('submitBtn');

  // Индикация загрузки
  function setLoading(on) {
    if (!btn) return;
    if (on) {
      btn.classList.add('is-loading');
      btn.setAttribute('aria-busy', 'true');
      btn.disabled = true;
    } else {
      btn.classList.remove('is-loading');
      btn.removeAttribute('aria-busy');
      btn.disabled = false;
    }
  }

  // Уведомления
  function setNote(msg, type) {
    if (!note) return;
    note.textContent = msg || '';
    note.className = 'form-note' + (type ? (' ' + type) : '');
  }

  // Live-валидация при фокусе
  if (fields.fio) {
    fields.fio.addEventListener('focus', () => setFieldState(boxes.fio, 'focus'));
    fields.fio.addEventListener('input', () => {
      setFieldState(boxes.fio, isFioValid(fields.fio.value) ? 'valid' : 'error');
    });
  }

  if (fields.phone) {
    fields.phone.addEventListener('focus', () => setFieldState(boxes.phone, 'focus'));
    fields.phone.addEventListener('input', () => {
      setFieldState(boxes.phone, isPhoneValid(fields.phone.value) ? 'valid' : 'error');
    });
  }

  if (fields.exp) {
    fields.exp.addEventListener('focus', () => setFieldState(boxes.exp, 'focus'));
    fields.exp.addEventListener('input', () => {
      setFieldState(boxes.exp, isExpValid(fields.exp.value) ? 'valid' : 'error');
    });
  }

  // Отправка формы
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    setNote('Отправляем…', 'info');
    setLoading(true);

    const result = await submitForm(form);

    if (result.success) {
      setNote('Готово! Анкета успешно отправлена. Мы свяжемся с вами.', 'success');
      form.reset();
      // Сброс состояний полей после успешной отправки
      if (boxes.fio) boxes.fio.classList.remove('is-focus', 'is-valid', 'is-error');
      if (boxes.phone) boxes.phone.classList.remove('is-focus', 'is-valid', 'is-error');
      if (boxes.exp) boxes.exp.classList.remove('is-focus', 'is-valid', 'is-error');
    } else {
      setNote(result.error || 'Ошибка отправки. Попробуйте позже.', 'error');
    }

    setLoading(false);
  });
}

