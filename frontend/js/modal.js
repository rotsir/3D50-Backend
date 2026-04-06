/**
 * Modal System — handles generic modal interactions
 */

export const modal = {
  /**
   * Open a modal by its ID
   * @param {string} modalId 
   */
  open(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden'; // Prevent scroll
  },

  /**
   * Close a modal by its ID or from child element
   * @param {string|HTMLElement} target 
   */
  close(target) {
    const overlay = typeof target === 'string'
      ? document.getElementById(target)
      : target.closest('.modal-overlay');

    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = ''; // Restore scroll
  },

  /**
   * Setup a generic modal with basic close behavior
   */
  setup(modalId) {
    const overlay = document.getElementById(modalId);
    if (!overlay) return;

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close(overlay);
    });

    // Close on button click
    const closeBtns = overlay.querySelectorAll('.modal__close, .btn-close');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.close(overlay));
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('open')) {
        this.close(overlay);
      }
    });
  }
};

export default modal;
