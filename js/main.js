// Выполняем после готовности DOM (на случай, если забыли defer)
document.addEventListener('DOMContentLoaded', () => {
  // ===== Мобильное меню
  const navToggle = document.getElementById('navToggle');
  const navLinks  = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navLinks.classList.toggle('show');
    });
  }

  // ===== Плавный скролл по якорям
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')?.slice(1);
      const el = id ? document.getElementById(id) : null;
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        navLinks?.classList.remove('show');
      }
    });
  });

  // ===== Простейшая обработка формы (демо)
  const form = document.getElementById('leadForm');
  const note = document.getElementById('formNote');
  if (form && note) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const payload = Object.fromEntries(fd.entries());
      if (!payload.name || !payload.phone || !payload.city || !payload.consent) {
        note.textContent = 'Проверьте поля формы';
        return;
      }
      console.log('LEAD_PAYLOAD', payload); // TODO: интеграция отправки
      note.textContent = 'Заявка принята. Мы свяжемся с вами.';
      form.reset();
    });
  }

  // ===== FAQ: аккордеон на .accordion__item
  document.querySelectorAll('.accordion__item').forEach(item => {
    const header = item.querySelector('.accordion__header');
    const panel  = item.querySelector('.accordion__panel');
    if (!header || !panel) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Оставить только один открытым — раскомментируй:
      // document.querySelectorAll('.accordion__item.open').forEach(it => {
      //   if (it !== item) {
      //     it.classList.remove('open');
      //     const p = it.querySelector('.accordion__panel');
      //     const h = it.querySelector('.accordion__header');
      //     if (p) p.hidden = true;
      //     if (h) h.setAttribute('aria-expanded', 'false');
      //   }
      // });

      item.classList.toggle('open', !isOpen);
      panel.hidden = isOpen;
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });

  // ===== (Опционально) если у тебя был код под <details> — удалён, чтобы не конфликтовал.
});

// Копирование e-mail с подсказкой
document.querySelectorAll('.contacts__email').forEach(btn => {
  const copied = btn.parentElement.querySelector('.contacts__copied');
  const email  = btn.dataset.copy || btn.textContent.trim();

  btn.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(email);
      if (copied){ copied.classList.add('show'); setTimeout(() => copied.classList.remove('show'), 1600); }
    }catch{
      // fallback
      const ta = document.createElement('textarea');
      ta.value = email; document.body.appendChild(ta); ta.select();
      try{ document.execCommand('copy'); } finally{ document.body.removeChild(ta); }
      if (copied){ copied.classList.add('show'); setTimeout(() => copied.classList.remove('show'), 1600); }
    }
  });
});

// ===== LEAD form validation (ЛОЖУР) =====
(function () {
  const form = document.getElementById('leadForm');
  if (!form) return;

  const fields = {
    fio: form.querySelector('#fio'),
    phone: form.querySelector('#phone'),
    exp: form.querySelector('#exp'),
  };

  const boxes = {
    fio: fields.fio.closest('.form-field'),
    phone: fields.phone.closest('.form-field'),
    exp: fields.exp.closest('.form-field'),
  };

  const note = document.getElementById('formNote');
  const btn  = document.getElementById('submitBtn');

  // --- helpers: индикатор и нотификатор ---
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

  function setNote(msg, type /* 'success' | 'error' | 'info' */) {
    if (!note) return;
    note.textContent = msg || '';
    note.className = 'form-note' + (type ? (' ' + type) : '');
  }

  // Утилиты валидации
  const normalizePhone = (v) => v.replace(/[^\d+]/g, '');
  const isFioValid = (v) => {
    const s = v.trim();
    if (s.length < 6) return false;
    return /^[A-Za-zА-Яа-яЁё\-\s]+$/.test(s);
  };
  const isPhoneValid = (v) => /^\+375\d{9}$/.test(normalizePhone(v));
  const isExpValid = (v) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 2;
  };

  const setState = (box, state /* 'neutral' | 'focus' | 'valid' | 'error' */) => {
    box.classList.remove('is-focus', 'is-valid', 'is-error');
    if (state === 'focus') box.classList.add('is-focus');
    if (state === 'valid') box.classList.add('is-valid');
    if (state === 'error') box.classList.add('is-error');
  };

  // Live-валидация
  fields.fio.addEventListener('focus', () => setState(boxes.fio, 'focus'));
  fields.phone.addEventListener('focus', () => setState(boxes.phone, 'focus'));
  fields.exp.addEventListener('focus', () => setState(boxes.exp, 'focus'));

  fields.fio.addEventListener('input', () => {
    setState(boxes.fio, isFioValid(fields.fio.value) ? 'valid' : 'error');
  });
  fields.phone.addEventListener('input', () => {
    setState(boxes.phone, isPhoneValid(fields.phone.value) ? 'valid' : 'error');
  });
  fields.exp.addEventListener('input', () => {
    setState(boxes.exp, isExpValid(fields.exp.value) ? 'valid' : 'error');
  });

  // Финальная проверка + отправка
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fioOK   = isFioValid(fields.fio.value);
    const phoneOK = isPhoneValid(fields.phone.value);
    const expOK   = isExpValid(fields.exp.value);

    setState(boxes.fio,   fioOK   ? 'valid' : 'error');
    setState(boxes.phone, phoneOK ? 'valid' : 'error');
    setState(boxes.exp,   expOK   ? 'valid' : 'error');

    if (!fioOK || !phoneOK || !expOK) {
      setNote('Проверьте обязательные поля: ФИО, телефон и стаж.', 'error');
      return;
    }

    // Готовим данные
    const fd = new FormData(form);

    // Склеим чекбоксы (docs) в читаемый список — опционально
    const docs = Array.from(form.querySelectorAll('input[name="docs"]:checked'))
                      .map(i => i.value || i.nextElementSibling?.textContent?.trim());
    if (docs.length) fd.append('docs_list', docs.join(', '));

    // --- Индикация загрузки ---
    setNote('Отправляем…', 'info');
    setLoading(true);

    try {
      // Если ты пока не подключил сервер — можно эмулировать:
      // await new Promise(r => setTimeout(r, 900));

      // Реальная отправка:
      const res  = await fetch(form.getAttribute('action') || 'send.php', { method: 'POST', body: fd });
      const data = await res.json().catch(() => ({}));

      if (data && data.ok) {
        setNote('Готово! Анкета успешно отправлена. Мы свяжемся с вами.', 'success');
        form.reset();
        setState(boxes.fio, 'neutral');
        setState(boxes.phone, 'neutral');
        setState(boxes.exp, 'neutral');
      } else {
        setNote((data && data.error) || 'Ошибка отправки. Попробуйте позже.', 'error');
      }
    } catch (err) {
      setNote('Сеть недоступна. Проверьте подключение и повторите попытку.', 'error');
    } finally {
      setLoading(false);
    }
  });
})();


  