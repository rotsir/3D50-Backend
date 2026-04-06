/**
 * product.js — Single product detail logic, reviews, and downloads
 */
import api       from './api.js';
import auth      from './auth.js';
import toast     from './toast.js';
import modal     from './modal.js';
import skeleton  from './skeleton.js';

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');

  if (!productId) {
    window.location.href = 'products.html';
    return;
  }

  const loadingEl = document.getElementById('product-loading');
  const contentEl = document.getElementById('product-content');

  // Elements
  const titleEl       = document.getElementById('product-title');
  const breadcrumbCat = document.getElementById('product-breadcrumb-cat');
  const mainImg       = document.getElementById('main-image');
  const thumbList     = document.getElementById('thumb-list');
  const descEl        = document.getElementById('product-description');
  const tagsEl        = document.getElementById('product-tags');
  const priceEl       = document.getElementById('product-price');
  const downloadsEl   = document.getElementById('product-downloads');
  const sizeEl        = document.getElementById('product-size');
  const formatEl      = document.getElementById('product-format');
  const reviewsList   = document.getElementById('reviews-list');
  const downloadBtn   = document.getElementById('download-btn');

  /**
   * Load Product Data
   */
  const loadProduct = async () => {
    try {
      const { product } = await api.get(`/products/${productId}`);
      
      titleEl.innerText       = product.title;
      breadcrumbCat.innerText = product.category_name;
      breadcrumbCat.parentElement.href = `/products.html?category=${product.category_id}`;
      descEl.innerHTML        = product.description;
      formatEl.innerText      = product.file_extension ? product.file_extension.toUpperCase() : 'N/A';
      downloadsEl.innerText   = product.downloads_count;
      
      // Formatting filesize
      const sizeMB = (product.file_size_bytes / (1024 * 1024)).toFixed(1);
      sizeEl.innerText = `${sizeMB} MB`;

      // Price rendering
      if (product.is_free) {
        priceEl.innerText = 'Free';
        priceEl.classList.add('product-price-free');
      } else {
        priceEl.innerText = `$${product.price}`;
      }

      // Images
      if (product.images && product.images.length) {
        const primary = product.images.find(img => img.is_primary) || product.images[0];
        mainImg.src = primary.image_path;

        thumbList.innerHTML = product.images.map((img, i) => `
          <div class="product-thumb ${img.id === primary.id ? 'active' : ''}" data-path="${img.image_path}">
            <img src="${img.image_path}" alt="${product.title} view ${i+1}">
          </div>
        `).join('');

        thumbList.querySelectorAll('.product-thumb').forEach(thumb => {
          thumb.addEventListener('click', () => {
            mainImg.src = thumb.dataset.path;
            thumbList.querySelector('.active').classList.remove('active');
            thumb.classList.add('active');
          });
        });
      }

      // Tags
      if (product.tags) {
        tagsEl.innerHTML = product.tags.map(t => `<a href="/products.html?tag=${t.slug}" class="tag">#${t.name}</a>`).join('');
      }

      loadingEl.style.display = 'none';
      contentEl.style.display = 'block';

      loadReviews();
      loadRelated(product.id);

    } catch (err) {
      console.error(err);
      toast.error('Failed to load product details.');
    }
  };

  /**
   * Load Reviews
   */
  const loadReviews = async () => {
    try {
      const { reviews } = await api.get('/reviews', { product_id: productId });
      if (reviews.length === 0) {
        reviewsList.innerHTML = '<p class="text-muted text-sm">No reviews yet. Be the first to rate this asset!</p>';
        return;
      }

      reviewsList.innerHTML = reviews.map(r => `
        <article class="review-card animate-fade-in">
          <div class="review-card__header">
            <div class="review-card__user">
              <div class="review-card__avatar">${r.username[0].toUpperCase()}</div>
              <span>${r.username}</span>
            </div>
            <div class="review-card__rating">
              ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
            </div>
          </div>
          <div class="review-card__title">${r.title || ''}</div>
          <p class="review-card__body">${r.body}</p>
          <div class="review-card__date">${new Date(r.created_at).toLocaleDateString()}</div>
        </article>
      `).join('');
    } catch (err) { console.error(err); }
  };

  /**
   * Handle Download Request
   */
  downloadBtn.addEventListener('click', async () => {
    if (!auth.isLoggedIn()) {
      toast.info('Please log in to download this asset.');
      setTimeout(() => window.location.href = 'login.html', 1500);
      return;
    }

    downloadBtn.classList.add('loading');
    downloadBtn.disabled = true;

    try {
      const { downloadUrl } = await api.post('/downloads/request', { product_id: productId });
      
      // Temporary link to trigger download
      const link = document.createElement('a');
      link.href = `http://localhost:3001${downloadUrl}`;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started!');
    } catch (err) {
      toast.error(err.message || 'Download failed.');
    } finally {
      downloadBtn.classList.remove('loading');
      downloadBtn.disabled = false;
    }
  });

  /**
   * Review Form
   */
  document.getElementById('post-review-trigger').addEventListener('click', () => {
    if (!auth.isLoggedIn()) {
      toast.info('Please log in to write a review.');
      return;
    }
    modal.open('review-modal');
  });

  const reviewForm = document.getElementById('review-form');
  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(reviewForm);
    const body = {
      product_id: parseInt(productId, 10),
      rating:    parseInt(formData.get('rating'), 10),
      title:     document.getElementById('review-title').value,
      body:      document.getElementById('review-body').value
    };

    if (!body.rating) { toast.error('Please select a star rating.'); return; }

    try {
      await api.post('/reviews', body);
      toast.success('Review posted successfully!');
      modal.close('review-modal');
      loadReviews(); // refresh
      reviewForm.reset();
    } catch (err) {
      toast.error(err.message || 'Failed to post review.');
    }
  });

  // Modal Setup
  modal.setup('review-modal');

  // Trigger load
  loadProduct();
});
