/**
 * Toast Notification System
 * Usage: import { toast } from './toast.js'; toast.success('Done!');
 */

const CONTAINER_ID = 'toast-container';
const DEFAULT_DURATION = 4000;

function getContainer() {
  let el = document.getElementById(CONTAINER_ID);
  if (!el) {
    el = document.createElement('div');
    el.id = CONTAINER_ID;
    el.className = 'toast-container';
    el.setAttribute('role', 'alert');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
  }
  return el;
}

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
};

function show(message, type = 'info', duration = DEFAULT_DURATION) {
  const container = getContainer();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');
  toast.innerHTML = `
    <span class="toast__icon" aria-hidden="true">${ICONS[type] || ICONS.info}</span>
    <span class="toast__message">${message}</span>
    <button class="toast__close" aria-label="Dismiss notification">×</button>
  `;

  const dismiss = () => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(24px)';
    toast.style.transition = 'all 0.2s ease';
    setTimeout(() => toast.remove(), 200);
  };

  toast.querySelector('.toast__close').addEventListener('click', dismiss);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  return dismiss;
}

export const toast = {
  success: (msg, duration) => show(msg, 'success', duration),
  error:   (msg, duration) => show(msg, 'error',   duration),
  warning: (msg, duration) => show(msg, 'warning',  duration),
  info:    (msg, duration) => show(msg, 'info',     duration),
};

export default toast;
