/**
 * Hero section reveal animation
 * Animates hero title words/characters with staggered reveal effect
 */
export function initHeroReveal() {
  const heroTitle = document.querySelector('.hero__title');
  if (!heroTitle) return;

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Skip animation, just show everything
    const allChars = heroTitle.querySelectorAll('.hero__title-word');
    allChars.forEach((word) => {
      word.style.opacity = '1';
    });
    const heroBullets = document.querySelector('.hero__bullets');
    const heroCta = document.querySelector('.hero__cta');
    const heroImage = document.querySelector('.hero__image--floating');
    if (heroBullets) heroBullets.style.opacity = '1';
    if (heroCta) heroCta.style.opacity = '1';
    if (heroImage) heroImage.style.opacity = '1';
    return;
  }

  // Split words into individual characters for reveal animation
  const titleWords = heroTitle.querySelectorAll('.hero__title-word');
  
  titleWords.forEach((word) => {
    const text = word.textContent.trim();
    if (!text) return;

    // Split into characters, preserving spaces
    const chars = text.split('');
    word.textContent = '';
    
    chars.forEach((char, index) => {
      const charSpan = document.createElement('span');
      charSpan.className = 'hero__char';
      charSpan.textContent = char === ' ' ? '\u00A0' : char; // Non-breaking space
      charSpan.style.opacity = '0';
      charSpan.style.transform = 'translateY(20px)';
      word.appendChild(charSpan);
    });
  });

  // Animate characters with stagger
  const allChars = heroTitle.querySelectorAll('.hero__char');
  const staggerDelay = 0.03; // 30ms between each character
  const animationDuration = 0.6;

  allChars.forEach((char, index) => {
    const delay = index * staggerDelay;
    
    setTimeout(() => {
      char.style.transition = `opacity ${animationDuration}s ease-out, transform ${animationDuration}s ease-out`;
      char.style.opacity = '1';
      char.style.transform = 'translateY(0)';
    }, delay * 1000);
  });

  // Animate other hero elements after title
  const heroBullets = document.querySelector('.hero__bullets');
  const heroCta = document.querySelector('.hero__cta');
  const heroImage = document.querySelector('.hero__image--floating');
  
  const totalChars = allChars.length;
  const titleAnimationEnd = (totalChars * staggerDelay + animationDuration) * 1000;

  if (heroBullets) {
    heroBullets.style.opacity = '0';
    heroBullets.style.transform = 'translateY(20px)';
    setTimeout(() => {
      heroBullets.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      heroBullets.style.opacity = '1';
      heroBullets.style.transform = 'translateY(0)';
    }, titleAnimationEnd);
  }

  if (heroCta) {
    heroCta.style.opacity = '0';
    heroCta.style.transform = 'translateY(20px)';
    setTimeout(() => {
      heroCta.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      heroCta.style.opacity = '1';
      heroCta.style.transform = 'translateY(0)';
    }, titleAnimationEnd + 200);
  }

  if (heroImage) {
    heroImage.style.opacity = '0';
    heroImage.style.transform = 'translateY(20px) scale(0.9)';
    setTimeout(() => {
      heroImage.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      heroImage.style.opacity = '1';
      heroImage.style.transform = 'translateY(0) scale(1)';
    }, titleAnimationEnd * 0.5); // Start image animation halfway through title
  }
}

