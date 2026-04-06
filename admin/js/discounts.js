/**
 * admin/discounts.js — Admin Discount scheduling logic
 */
import api   from '../../frontend/js/api.js';
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

  const tableBody = document.getElementById('discount-body');
  const form      = document.getElementById('discount-form');

  /**
   * Load Discounts
   */
  const loadDiscounts = async () => {
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Fetching discount schedules...</td></tr>';
    try {
      const { discounts } = await api.get('/admin/discounts');
      tableBody.innerHTML = discounts.map(d => `
        <tr>
          <td>#${d.id}</td>
          <td><div class="font-weight-bold">${d.name}</div></td>
          <td>${d.scope || 'Global'}</td>
          <td>${d.type === 'percentage' ? d.value + '%' : '$' + d.value}</td>
          <td>
            <div class="text-xs">Start: ${new Date(d.starts_at).toLocaleString()}</div>
            <div class="text-xs">End: ${new Date(d.ends_at).toLocaleString()}</div>
          </td>
          <td>
            <span class="admin-status-badge status--${d.is_active ? 'published' : 'hidden'}">
              ${d.is_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </td>
          <td>
            <div style="display:flex;gap:var(--space-2);">
              <button class="btn btn-secondary btn-sm toggle-btn" data-id="${d.id}" data-active="${!d.is_active}">
                ${d.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button class="btn btn-secondary btn-sm text-error delete-btn" data-id="${d.id}">Del</button>
            </div>
          </td>
        </tr>
      `).join('');

      tableBody.querySelectorAll('.toggle-btn').forEach(btn => 
        btn.addEventListener('click', () => toggleDiscount(btn.dataset.id, btn.dataset.active === 'true')));
      tableBody.querySelectorAll('.delete-btn').forEach(btn => 
        btn.addEventListener('click', () => deleteDiscount(btn.dataset.id)));

    } catch (err) { toast.error('Failed to load discounts.'); }
  };

  /**
   * Save Discount
   */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name:      document.getElementById('name').value,
      type:      document.getElementById('type').value,
      value:     parseFloat(document.getElementById('value').value),
      starts_at: document.getElementById('starts_at').value,
      ends_at:   document.getElementById('ends_at').value,
      is_active: 1
    };

    try {
      await api.post('/admin/discounts', data);
      toast.success('Discount created!');
      modal.close('discount-modal');
      loadDiscounts();
    } catch (err) { toast.error('Failed to create discount.'); }
  });

  /**
   * Toggle Discount
   */
  const toggleDiscount = async (id, active) => {
    try {
      await api.post(`/admin/discounts/${id}/toggle`, { is_active: active ? 1 : 0 });
      toast.success(active ? 'Discount activated.' : 'Discount deactivated.');
      loadDiscounts();
    } catch (err) { toast.error('Operation failed.'); }
  };

  /**
   * Delete Discount
   */
  const deleteDiscount = async (id) => {
    if (!confirm('Permanently delete this discount rule?')) return;
    try {
      await api.delete(`/admin/discounts/${id}`);
      toast.success('Discount deleted.');
      loadDiscounts();
    } catch (err) { toast.error('Delete failed.'); }
  };

  document.getElementById('add-discount-trigger').addEventListener('click', () => {
    form.reset();
    modal.open('discount-modal');
  });

  modal.setup('discount-modal');

  // Init
  loadDiscounts();
});
