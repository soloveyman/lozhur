// Главный файл - точка входа
import { initSmoothScroll } from './modules/smooth-scroll.js';
import { initAccordion } from './modules/accordion.js';
import { initCopyEmail } from './modules/copy-email.js';
import { initFormHandler } from './modules/form-handler.js';
import { initButtonAnimation } from './modules/button-animation.js';
import { initMobileMenu } from './modules/mobile-menu.js';
import { initBenefitsToggle } from './modules/benefits-toggle.js';

// Инициализация после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  initSmoothScroll();
  initAccordion();
  initCopyEmail();
  initFormHandler();
  initButtonAnimation();
  initMobileMenu();
  initBenefitsToggle();
});
