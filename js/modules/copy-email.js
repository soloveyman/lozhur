// Копирование email в буфер обмена
export function initCopyEmail() {
  document.querySelectorAll('.contacts__email').forEach(btn => {
    const copied = btn.parentElement.querySelector('.contacts__copied');
    const email = btn.dataset.copy || btn.textContent.trim();

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(email);
        if (copied) {
          copied.classList.add('show');
          setTimeout(() => copied.classList.remove('show'), 1600);
        }
      } catch {
        // Fallback для старых браузеров
        const ta = document.createElement('textarea');
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } finally {
          document.body.removeChild(ta);
        }
        if (copied) {
          copied.classList.add('show');
          setTimeout(() => copied.classList.remove('show'), 1600);
        }
      }
    });
  });
}

