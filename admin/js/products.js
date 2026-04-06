/**
 * admin/products.js — Admin Product Inventory Management
 */
import api   from '../../frontend/js/api.js';
import auth  from '../../frontend/js/auth.js';
import toast from '../../frontend/js/toast.js';
import modal from '../../frontend/js/modal.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = auth.getUser();

  // Basic RBAC check
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'super')) {
    toast.error('Unauthorized access. Admin privileges required.');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  const tableBody     = document.getElementById('admin-product-body');
  const pagination    = document.getElementById('admin-pagination');
  const searchInput   = document.getElementById('admin-product-search');
  const catFilter     = document.getElementById('admin-cat-filter');
  const productForm   = document.getElementById('product-form');
  const modalEl       = document.getElementById('product-modal');

  // State
  let filters = { page: 1, limit: 10, q: '', category: '' };

  /**
   * Load Products with filters
   */
  const loadProducts = async () => {
    tableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading Inventory...</td></tr>';
    
    try {
      const { products, meta } = await api.get('/admin/products', filters);
      
      if (products.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">No products found.</td></tr>';
      } else {
        tableBody.innerHTML = products.map(p => `
          <tr>
            <td>#${p.id}</td>
            <td>
              <img src="${p.primary_image || '/img/placeholder.jpg'}" 
                 style="width:40px;height:40px;object-fit:cover;border-radius:4px;">
            </td>
            <td><div class="font-weight-bold">${p.title}</div><div class="text-xs text-muted">SKU: ${p.id}</div></td>
            <td>${p.category_name}</td>
            <td>$${p.price}</td>
            <td>${p.downloads_count}</td>
            <td><span class="admin-status-badge status--${p.status}">${p.status}</span></td>
            <td>
              <div style="display:flex;gap:var(--space-2);">
                <button class="btn btn-secondary btn-sm edit-btn" data-id="${p.id}">Edit</button>
                <button class="btn btn-secondary btn-sm text-error delete-btn" data-id="${p.id}">Del</button>
              </div>
            </td>
          </tr>
        `).join('');

        // Re-attach listeners
        tableBody.querySelectorAll('.edit-btn').forEach(btn => 
          btn.addEventListener('click', () => openEditModal(btn.dataset.id)));
        
        tableBody.querySelectorAll('.delete-btn').forEach(btn => 
          btn.addEventListener('click', () => deleteProduct(btn.dataset.id)));
      }
      renderPagination(meta);
    } catch (err) { toast.error('Failed to load inventory.'); }
  };

  /**
   * Render Pagination
   */
  const renderPagination = (meta) => {
    const { page, totalPages } = meta;
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
    
    pagination.innerHTML = `
      <button class="btn btn-secondary btn-sm" ${page <= 1 ? 'disabled' : ''} id="prev-page">Prev</button>
      <span class="text-xs text-muted">Page ${page} of ${totalPages}</span>
      <button class="btn btn-secondary btn-sm" ${page >= totalPages ? 'disabled' : ''} id="next-page">Next</button>
    `;

    document.getElementById('prev-page')?.addEventListener('click', () => { filters.page--; loadProducts(); });
    document.getElementById('next-page')?.addEventListener('click', () => { filters.page++; loadProducts(); });
  };

  /**
   * Load Categories for form and filter
   */
  const loadCategories = async () => {
    try {
      const { categories } = await api.get('/categories');
      const options = categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
      catFilter.innerHTML += options;
      document.getElementById('category_id').innerHTML = options;
    } catch (err) { console.error(err); }
  };

  /**
   * Open Modal for Add/Edit
   */
  const openEditModal = async (id = null) => {
    productForm.reset();
    document.getElementById('edit-id').value = id || '';
    document.getElementById('modal-title').innerText = id ? 'Edit Product' : 'Add New Product';

    if (id) {
      try {
        const { product } = await api.get(`/products/${id}`);
        document.getElementById('title').value       = product.title;
        document.getElementById('category_id').value = product.category_id;
        document.getElementById('price').value       = product.price;
        document.getElementById('description').value = product.description;
        document.getElementById('status').value      = product.status;
        document.getElementById('slug').value        = product.slug;
        document.getElementById('tags').value        = product.tags ? product.tags.map(t => t.name).join(', ') : '';
      } catch (err) { toast.error('Failed to fetch product.'); return; }
    }
    modal.open('product-modal');
  };

  /**
   * Save Product (Handle Multipart)
   */
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const formData = new FormData();
    
    // Manual append because we have files
    formData.append('title',       document.getElementById('title').value);
    formData.append('category_id', document.getElementById('category_id').value);
    formData.append('price',       document.getElementById('price').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('status',      document.getElementById('status').value);
    formData.append('slug',        document.getElementById('slug').value);
    formData.append('tags',        document.getElementById('tags').value);

    const primaryImg = document.getElementById('primary_image').files[0];
    const assetFile  = document.getElementById('asset_file').files[0];
    
    if (primaryImg) formData.append('primary_image', primaryImg);
    if (assetFile)  formData.append('asset_file',  assetFile);

    const submitBtn = document.getElementById('save-product');
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      if (id) {
         await api.put(`/admin/products/${id}`, formData);
         toast.success('Product updated!');
      } else {
         await api.post('/admin/products', formData);
         toast.success('Product created!');
      }
      modal.close('product-modal');
      loadProducts();
    } catch (err) {
      toast.error(err.message || 'Operation failed.');
    } finally {
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });

  /**
   * Delete Product
   */
  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) return;
    try {
      await api.delete(`/admin/products/${id}`);
      toast.success('Product deleted.');
      loadProducts();
    } catch (err) { toast.error('Delete failed.'); }
  };

  // Search/Filter events
  searchInput.addEventListener('input', (e) => { filters.q = e.target.value; filters.page = 1; loadProducts(); });
  catFilter.addEventListener('change', (e) => { filters.category = e.target.value; filters.page = 1; loadProducts(); });
  document.getElementById('add-product-trigger').addEventListener('click', () => openEditModal());

  // Init
  modal.setup('product-modal');
  loadCategories();
  loadProducts();
});
