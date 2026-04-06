/**
 * home.js — Homepage logic for 3D50.com
 * Handles product sections, category loading, and search bar interaction.
 */
import api       from './api.js';
import skeleton  from './skeleton.js';
import { createProductCard } from '../components/ProductCard.js';

document.addEventListener('DOMContentLoaded', async () => {
  const categoriesGrid = document.getElementById('categories-grid');
  const featuredGrid   = document.getElementById('featured-grid');
  const trendingGrid   = document.getElementById('trending-grid');
  const discountedGrid = document.getElementById('discounted-grid');
  const latestGrid     = document.getElementById('latest-grid');

  /**
   * Fetch and render categories
   */
  const loadCategories = async () => {
    try {
      const { categories } = await api.get('/categories');
      categoriesGrid.innerHTML = categories
        .slice(0, 10) // Only top 10 for home
        .map(cat => `
          <a href="/products.html?category=${cat.id}" class="category-card animate-fade-in">
            <div class="category-card__icon">${cat.icon || '📦'}</div>
            <div class="category-card__name">${cat.name}</div>
            <div class="category-card__count">${cat.product_count} products</div>
          </a>
        `).join('');
    } catch (err) {
      console.error('Failed to load categories', err);
      categoriesGrid.innerHTML = '<div class="error-state">Failed to load categories.</div>';
    }
  };

  /**
   * Fetch and render all product sections
   */
  const loadSections = async () => {
    // Show skeletons
    featuredGrid.innerHTML   = skeleton.grid(4);
    trendingGrid.innerHTML   = skeleton.grid(4);
    discountedGrid.innerHTML = skeleton.grid(4);
    latestGrid.innerHTML     = skeleton.grid(8);

    try {
      const data = await api.get('/products/homepage');
      
      featuredGrid.innerHTML   = data.featured.map(createProductCard).join('');
      trendingGrid.innerHTML   = data.trending.map(createProductCard).join('');
      discountedGrid.innerHTML = data.discounted.map(createProductCard).join('');
      latestGrid.innerHTML     = data.latest.map(createProductCard).join('');

    } catch (err) {
      console.error('Failed to load products', err);
      // Fallback or error states
    }
  };

  /**
   * Search interactivity
   */
  const setupSearch = () => {
    const heroInput = document.getElementById('hero-search-input');
    const heroBtn   = document.getElementById('hero-search-btn');
    const navInput  = document.getElementById('nav-search-input');

    const handleSearch = (q) => {
      if (!q.trim()) return;
      window.location.href = `/products.html?q=${encodeURIComponent(q.trim())}`;
    };

    heroBtn.addEventListener('click', () => handleSearch(heroInput.value));
    heroInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch(heroInput.value);
    });

    navInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch(navInput.value);
    });
  };

  // Run initialisers
  loadCategories();
  loadSections();
  setupSearch();
});
