/**
 * admin/reviews.js — Admin Review moderation logic
 */
import api   from '../../frontend/js/api.js';
import toast from '../../frontend/js/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = auth.getUser();

  // Basic RBAC check
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'super')) {
    toast.error('Unauthorized access. Admin privileges required.');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  const tableBody = document.getElementById('review-body');

  /**
   * Load all reviews for moderation
   */
  const loadReviews = async () => {
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Fetching reviews...</td></tr>';
    try {
      // admin endpoint to get reviews with full data
      const { reviews } = await api.get('/admin/reviews');
      tableBody.innerHTML = reviews.map(r => `
        <tr>
          <td>#${r.id}</td>
          <td>${r.product_title}</td>
          <td>${r.username}</td>
          <td>${'★'.repeat(r.rating)}</td>
          <td>
            <div class="font-weight-bold">${r.title || '-'}</div>
            <div class="text-xs text-muted">${r.body.substring(0, 50)}...</div>
          </td>
          <td><span class="admin-status-badge status--${r.is_hidden ? 'hidden' : 'published'}">${r.is_hidden ? 'HIDDEN' : 'VISIBLE'}</span></td>
          <td>
            <div style="display:flex;gap:var(--space-2);">
              <button class="btn btn-secondary btn-sm toggle-hide" data-id="${r.id}" data-hide="${!r.is_hidden}">
                ${r.is_hidden ? 'Show' : 'Hide'}
              </button>
              <button class="btn btn-secondary btn-sm text-error delete-btn" data-id="${r.id}">Del</button>
            </div>
          </td>
        </tr>
      `).join('');

      tableBody.querySelectorAll('.toggle-hide').forEach(btn => 
        btn.addEventListener('click', () => toggleReview(btn.dataset.id, btn.dataset.hide === 'true')));
      tableBody.querySelectorAll('.delete-btn').forEach(btn => 
        btn.addEventListener('click', () => deleteReview(btn.dataset.id)));

    } catch (err) { toast.error('Failed to load reviews.'); }
  };

  /**
   * Toggle review visibility
   */
  const toggleReview = async (id, hide) => {
    try {
      if (hide) await api.post(`/admin/reviews/${id}/hide`);
      else await api.post(`/admin/reviews/${id}/approve`); // "approve" is used for making visible
      toast.success(hide ? 'Review hidden.' : 'Review approved/visible.');
      loadReviews();
    } catch (err) { toast.error('Operation failed.'); }
  };

  /**
   * Delete review
   */
  const deleteReview = async (id) => {
    if (!confirm('Permanently delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${id}`);
      toast.success('Review deleted.');
      loadReviews();
    } catch (err) { toast.error('Delete failed.'); }
  };

  // Init
  loadReviews();
});
