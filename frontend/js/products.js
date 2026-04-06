/**
 * products.js — Product listing and search logic
 */
import api       from './api.js';
import skeleton  from './skeleton.js';
import { createProductCard } from '../components/ProductCard.js';

document.addEventListener('DOMContentLoaded', () => {
  const productsGrid = document.getElementById('products-grid');
  const catFilters   = document.getElementById('category-filters');
  const searchTitle  = document.getElementById('browse-title');
  const resultsCount = document.getElementById('results-count');
  const pagination   = document.getElementById('pagination-controls');

  // State
  let filters = {
    page: 1,
    limit: 24,
    sort: 'newest',
    q: '',
    category: '',
    price_min: '',
    price_max: '',
    is_free: false
  };

  /**
   * Parse URL Query Params into filters
   */
  const parseUrlParams = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q'))        filters.q        = params.get('q');
    if (params.get('category')) filters.category = params.get('category');
    if (params.get('sort'))     filters.sort     = params.get('sort');
    if (params.get('is_free'))   filters.is_free  = params.get('is_free') === '1';
    if (params.get('page'))     filters.page     = parseInt(params.get('page'), 10);
    
    // Update UI title if searching
    if (filters.q) searchTitle.innerText = `Search: ${filters.q}`;
  };

  /**
   * Fetch and render products
   */
  const loadProducts = async () => {
    productsGrid.innerHTML = skeleton.grid(12);
    
    try {
      const params = { ...filters };
      if (params.is_free) params.is_free = 1; else delete params.is_free;
      if (!params.q)      delete params.q;

      const { products, meta } = await api.get('/products', params);
      
      if (products.length === 0) {
        productsGrid.innerHTML = '<div class="empty-state">No products found matching your criteria.</div>';
      } else {
        productsGrid.innerHTML = products.map(createProductCard).join('');
      }

      resultsCount.innerText = `Showing ${products.length} of ${meta.total} results`;
      renderPagination(meta);

    } catch (err) {
      console.error('Failed to load products', err);
      productsGrid.innerHTML = '<div class="error-state">Failed to load result.</div>';
    }
  };

  /**
   * Render categories in sidebar
   */
  const loadCategoryFilters = async () => {
    try {
      const { categories } = await api.get('/categories');
      catFilters.innerHTML = categories.map(cat => `
        <label class="filter-item ${filters.category == cat.id ? 'active' : ''}">
          <input type="radio" name="filter-cat" value="${cat.id}" ${filters.category == cat.id ? 'checked' : ''}>
          <span>${cat.name}</span>
          <span class="text-xs text-muted">(${cat.product_count})</span>
        </label>
      `).join('');

      // Add "All Categories" option
      catFilters.insertAdjacentHTML('afterbegin', `
        <label class="filter-item ${!filters.category ? 'active' : ''}">
          <input type="radio" name="filter-cat" value="" ${!filters.category ? 'checked' : ''}>
          <span>All Categories</span>
        </label>
      `);

      // Handle category filter clicks
      catFilters.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', (e) => {
          filters.category = e.target.value;
          filters.page = 1;
          updateUrlAndReload();
        });
      });

    } catch (err) { console.error(err); }
  };

  /**
   * Render pagination controls
   */
  const renderPagination = (meta) => {
    const { page, totalPages, total } = meta;
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }

    let html = `
      <button class="pagination__btn" ${page <= 1 ? 'disabled' : ''} data-page="${page - 1}">←</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= page - 2 && i <= page + 2)) {
            html += `<button class="pagination__btn ${i === page ? 'active' : ''}" data-page="${i}">${i}</button>`;
        } else if (i === page - 3 || i === page + 3) {
            html += `<span class="pagination__info">...</span>`;
        }
    }

    html += `<button class="pagination__btn" ${page >= totalPages ? 'disabled' : ''} data-page="${page + 1}">→</button>`;
    
    pagination.innerHTML = html;

    pagination.querySelectorAll('.pagination__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filters.page = parseInt(btn.dataset.page, 10);
        updateUrlAndReload();
      });
    });
  };

  /**
   * Update URL without refreshing and reload data
   */
  const updateUrlAndReload = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    loadProducts();
  };

  // Setup Event Listeners
  document.getElementById('price-min').addEventListener('change', (e) => { filters.price_min = e.target.value; updateUrlAndReload(); });
  document.getElementById('price-max').addEventListener('change', (e) => { filters.price_max = e.target.value; updateUrlAndReload(); });
  document.getElementById('filter-free').addEventListener('change', (e) => { filters.is_free = e.target.checked; updateUrlAndReload(); });
  
  document.querySelectorAll('input[name="sort"]').forEach(radio => {
    radio.addEventListener('change', (e) => { filters.sort = e.target.value; updateUrlAndReload(); });
  });

  document.getElementById('limit-select').addEventListener('change', (e) => { 
    filters.limit = parseInt(e.target.value, 10); 
    filters.page = 1; 
    updateUrlAndReload(); 
  });

  document.getElementById('clear-filters').addEventListener('click', () => {
    filters = { page: 1, limit: 24, sort: 'newest', q: '', category: '', price_min: '', price_max: '', is_free: false };
    window.location.href = window.location.pathname;
  });

  // Init
  parseUrlParams();
  loadCategoryFilters();
  loadProducts();
});
