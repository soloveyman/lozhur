/**
 * Scroll-based reveal animations for sections
 * Applies word-by-word reveals for titles and staggered reveals for cards
 */
export function initScrollReveal() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Show all elements immediately
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
    return;
  }

  // Setup Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const revealType = element.dataset.reveal;

        if (revealType === 'title') {
          revealTitle(element);
        } else if (revealType === 'word') {
          revealWord(element);
        } else if (revealType === 'card') {
          revealCard(element);
        } else if (revealType === 'list') {
          revealList(element);
        }

        observer.unobserve(element);
      }
    });
  }, observerOptions);

  // Setup title reveals (word-by-word)
  document.querySelectorAll('[data-reveal="title"]').forEach((title) => {
    splitTitleIntoWords(title);
    title.style.opacity = '0';
    observer.observe(title);
  });

  // Setup card reveals
  document.querySelectorAll('[data-reveal="card"]').forEach((card) => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    observer.observe(card);
  });

  // Setup list item reveals
  document.querySelectorAll('[data-reveal="list"]').forEach((list) => {
    const items = list.querySelectorAll('[data-reveal-item]');
    items.forEach((item) => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
    });
    observer.observe(list);
  });
}

/**
 * Split title into words for word-by-word reveal
 */
function splitTitleIntoWords(element) {
  const text = element.textContent.trim();
  if (!text) return;

  const words = text.split(/\s+/);
  element.textContent = '';

  words.forEach((word, index) => {
    const wordSpan = document.createElement('span');
    wordSpan.className = 'reveal-word';
    wordSpan.textContent = word;
    wordSpan.style.opacity = '0';
    wordSpan.style.transform = 'translateY(20px)';
    wordSpan.style.display = 'inline-block';
    wordSpan.style.willChange = 'opacity, transform';
    element.appendChild(wordSpan);

    if (index < words.length - 1) {
      element.appendChild(document.createTextNode(' '));
    }
  });
}

/**
 * Reveal title with word-by-word animation
 */
function revealTitle(element) {
  const words = element.querySelectorAll('.reveal-word');
  const staggerDelay = 0.05; // 50ms between words
  const duration = 0.6;

  words.forEach((word, index) => {
    const delay = index * staggerDelay;
    setTimeout(() => {
      word.style.transition = `opacity ${duration}s ease-out, transform ${duration}s ease-out`;
      word.style.opacity = '1';
      word.style.transform = 'translateY(0)';
    }, delay * 1000);
  });

  // Fade in container
  element.style.transition = 'opacity 0.3s ease-out';
  element.style.opacity = '1';
}

/**
 * Reveal single word
 */
function revealWord(element) {
  element.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
  element.style.opacity = '1';
  element.style.transform = 'translateY(0)';
}

/**
 * Reveal card with fade and slide
 */
function revealCard(element) {
  const delay = parseFloat(element.dataset.revealDelay) || 0;
  setTimeout(() => {
    element.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
  }, delay * 1000);
}

/**
 * Reveal list items with stagger
 */
function revealList(listContainer) {
  const items = listContainer.querySelectorAll('[data-reveal-item]');
  const staggerDelay = 0.1; // 100ms between items
  const duration = 0.6;

  items.forEach((item, index) => {
    const delay = index * staggerDelay;
    setTimeout(() => {
      item.style.transition = `opacity ${duration}s ease-out, transform ${duration}s ease-out`;
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, delay * 1000);
  });
}

