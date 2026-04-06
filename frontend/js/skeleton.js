/**
 * Skeleton Loader Service — generates placeholder elements
 */

export const skeleton = {
  /**
   * Render a skeleton for a product card
   * @returns {string} 
   */
  productCard() {
    return `
      <div class="skeleton-card">
        <div class="skeleton skeleton-card__image"></div>
        <div class="skeleton-card__body">
          <div class="skeleton skeleton-text-sm"></div>
          <div class="skeleton skeleton-text-lg"></div>
          <div style="display:flex;justify-content:space-between;margin-top:auto">
            <div class="skeleton skeleton-text-md" style="width:30%"></div>
            <div class="skeleton skeleton-text-md" style="width:20%"></div>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Render a grid of skeletons
   */
  grid(count = 8, type = 'productCard') {
    return Array(count).fill(this[type]()).join('');
  }
};

export default skeleton;
