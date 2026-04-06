/**
 * ProductCard Component — returns a clean HTML template for a product card
 * Uses standard CSS classes from components.css
 */

export function createProductCard(product) {
  const {
    id, title, price, is_free, avg_rating, downloads_count,
    category_name, primary_image, is_featured, discount_type, discount_value
  } = product;

  const displayPrice = is_free ? 'Free' : `$${price}`;
  const priceClass   = is_free ? 'product-card__price--free' : '';
  
  // Calculate star rating
  const fullStars  = Math.floor(avg_rating || 0);
  const emptyStars = 5 - fullStars;
  const starsHtml  = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);

  return `
    <article class="product-card" onclick="location.href='/product.html?id=${id}'" role="button" aria-pressed="false" tabindex="0">
      ${is_featured ? '<span class="badge-featured">Featured</span>' : ''}
      ${is_free ? '<span class="badge-free">Free</span>' : ''}
      ${discount_value ? `<span class="badge-discount">-${discount_value}${discount_type === 'percentage' ? '%' : '$'}</span>` : ''}

      <div class="product-card__image-wrap">
        <img 
          src="${primary_image || '/img/placeholder.jpg'}" 
          alt="${title}" 
          class="product-card__image" 
          loading="lazy"
        >
        <div class="product-card__overlay">
          <button class="btn btn-primary btn-sm">View Details</button>
        </div>
      </div>

      <div class="product-card__body">
        <span class="product-card__category">${category_name || 'Asset'}</span>
        <h3 class="product-card__title">${title}</h3>
        
        <div class="product-card__meta">
          <div class="product-card__price ${priceClass}">${displayPrice}</div>
          <div class="product-card__rating">
            <span class="product-card__stars">${starsHtml}</span>
            <span>(${avg_rating || 0})</span>
          </div>
          <div class="product-card__downloads">
            <span>↓ ${downloads_count || 0}</span>
          </div>
        </div>
      </div>
    </article>
  `;
}

export default createProductCard;
