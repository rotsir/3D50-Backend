/**
 * admin/dashboard.js — Admin Panel Overview stats
 */
import api   from '../../frontend/js/api.js';
import auth  from '../../frontend/js/auth.js';
import toast from '../../frontend/js/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  const user = auth.getUser();

  // Basic RBAC check
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'super')) {
    toast.error('Unauthorized access. Admin privileges required.');
    setTimeout(() => window.location.href = 'login.html', 1500);
    return;
  }

  /**
   * Load Dashboard Stats
   */

  /**
   * Load Dashboard Stats
   */
  const loadStats = async () => {
    try {
      const stats = await api.get('/admin/dashboard/stats');
      
      document.getElementById('stat-total-products').innerText  = stats.total_products || 0;
      document.getElementById('stat-total-users').innerText     = stats.total_users || 0;
      document.getElementById('stat-total-downloads').innerText = stats.total_downloads || 0;
      document.getElementById('stat-total-revenue').innerText   = `$${(stats.total_revenue || 0).toLocaleString()}`;

      // Load recent activity from dashboard endpoint
      const activityBody = document.getElementById('recent-activity-body');
      if (stats.recent_activity.length === 0) {
        activityBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No recent activity.</td></tr>';
      } else {
        activityBody.innerHTML = stats.recent_activity.map(a => `
          <tr>
            <td>#${a.id}</td>
            <td>${a.username}</td>
            <td>${a.product_title}</td>
            <td><span class="admin-status-badge status--published">SUCCESS</span></td>
            <td>${new Date(a.date).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }
    } catch (err) {
      toast.error('Failed to load admin stats. Check back-end connectivity.');
    }
  };

  // Sign out
  document.getElementById('admin-logout').addEventListener('click', () => auth.logout());

  // Init
  loadStats();
});
