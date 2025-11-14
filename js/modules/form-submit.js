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

  // Обработка чекбоксов документов - получаем читаемые названия
  const allDocs = Array.from(form.querySelectorAll('input[name="docs[]"]'));
  const docNames = {
    'med': 'Водительская мед. справка с правом найма',
    'upg': 'Свидетельство о повышении квалификации по кат. B (если стаж > 5 лет)',
    'taxi-cert': 'Свидетельство об обучении водителя такси',
    'lpg': 'Обучение для работы на автомобиле с газовым оборудованием',
    'badge': 'Бейдж согласно стандартам работы в такси',
    'workbook': 'Трудовая книга',
    'mil': 'Военный билет'
  };
  
  const checkedLabels = [];
  
  allDocs.forEach((input) => {
    const value = input.value;
    const readableName = docNames[value] || input.nextElementSibling?.textContent?.trim() || value;
    if (input.checked) {
      checkedLabels.push(readableName);
    }
  });

  // Формируем тело письма для FormSubmit
  const emailBody = [
    'Новая заявка на трудоустройство',
    '',
    '═══════════════════════════════════════',
    '',
    `ФИО: ${fields.fio?.value || ''}`,
    `Телефон: ${fields.phone?.value || ''}`,
    `Стаж по кат. B: ${fields.exp?.value || ''} лет`,
    ''
  ];

  if (checkedLabels.length > 0) {
    emailBody.push('Документы:');
    checkedLabels.forEach(label => {
      emailBody.push(`  ✓ ${label}`);
    });
  } else {
    emailBody.push('Документы: не указаны');
  }

  emailBody.push('');
  emailBody.push('═══════════════════════════════════════');

  // Добавляем специальные поля для FormSubmit
  fd.append('_subject', 'Новая заявка с сайта ЛОЖУР');
  fd.append('_template', 'box');
  fd.append('_message', emailBody.join('\n'));
  fd.append('_replyto', fields.phone?.value || '');

  // Отправка через FormSubmit
  try {
    const res = await fetch('https://formsubmit.co/ajax/lojour.pinsk@yandex.by', {
      method: 'POST',
      body: fd,
      headers: {
        'Accept': 'application/json'
      }
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok && (data.success === true || data.message)) {
      return { success: true };
    } else {
      return { success: false, error: data.message || 'Ошибка отправки. Попробуйте позже.' };
    }
  } catch (err) {
    return { success: false, error: 'Сеть недоступна. Проверьте подключение и повторите попытку.' };
  }
}

