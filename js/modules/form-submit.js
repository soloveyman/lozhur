// Отправка формы на сервер
import { isFioValid, isPhoneValid, isExpValid, setFieldState } from './form-validation.js';

export async function submitForm(form) {
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

  // Валидация
  const fioOK = isFioValid(fields.fio?.value || '');
  const phoneOK = isPhoneValid(fields.phone?.value || '');
  const expOK = isExpValid(fields.exp?.value || '');

  // Установка состояний полей
  if (boxes.fio) setFieldState(boxes.fio, fioOK ? 'valid' : 'error');
  if (boxes.phone) setFieldState(boxes.phone, phoneOK ? 'valid' : 'error');
  if (boxes.exp) setFieldState(boxes.exp, expOK ? 'valid' : 'error');

  if (!fioOK || !phoneOK || !expOK) {
    return { success: false, error: 'Проверьте обязательные поля: ФИО, телефон и стаж.' };
  }

  // Подготовка данных
  const fd = new FormData(form);

  // Обработка чекбоксов документов
  const allDocs = Array.from(form.querySelectorAll('input[name="docs[]"]'));
  const slug = (s) => (s || '').toString().trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const checkedLabels = [];
  
  allDocs.forEach((input) => {
    const title = input.value || input.nextElementSibling?.textContent?.trim() || 'item';
    if (input.checked) checkedLabels.push(title);
    fd.append(`docs_${slug(title)}`, input.checked ? 'true' : 'false');
  });
  
  if (checkedLabels.length) {
    fd.append('docs_list', checkedLabels.join(', '));
    checkedLabels.forEach((t, i) => fd.append(`docs_value_${i + 1}`, t));
  }

  // Отправка
  try {
    const res = await fetch('send.php', { method: 'POST', body: fd });
    const data = await res.json().catch(() => ({}));

    if (data && data.ok) {
      return { success: true };
    } else {
      return { success: false, error: (data && data.error) || 'Ошибка отправки. Попробуйте позже.' };
    }
  } catch (err) {
    return { success: false, error: 'Сеть недоступна. Проверьте подключение и повторите попытку.' };
  }
}

