/**
 * admin/users.js — Admin User Management
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

  const tableBody = document.getElementById('user-body');
  const searchInput = document.getElementById('user-search');

  /**
   * Load Users
   */
  const loadUsers = async (q = '') => {
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Fetching user base...</td></tr>';
    try {
      const { users } = await api.get('/admin/users', { q });
      tableBody.innerHTML = users.map(u => `
        <tr>
          <td>#${u.id}</td>
          <td>${u.username}</td>
          <td>${u.email}</td>
          <td><span class="badge ${u.role === 'admin' ? 'badge-featured' : ''}">${u.role}</span></td>
          <td>
            <span class="admin-status-badge status--${u.status || 'published'}">${u.status || 'Active'}</span>
          </td>
          <td>${new Date(u.created_at).toLocaleDateString()}</td>
          <td>
            <div style="display:flex;gap:var(--space-2);">
              ${u.status === 'blocked' 
                ? `<button class="btn btn-secondary btn-sm unblock-btn" data-id="${u.id}">Unblock</button>` 
                : `<button class="btn btn-secondary btn-sm block-btn" data-id="${u.id}">Block</button>`}
              <button class="btn btn-secondary btn-sm text-error delete-btn" data-id="${u.id}">Del</button>
            </div>
          </td>
        </tr>
      `).join('');

      // Event listeners
      tableBody.querySelectorAll('.block-btn').forEach(btn => 
        btn.addEventListener('click', () => toggleBlock(btn.dataset.id, true)));
      tableBody.querySelectorAll('.unblock-btn').forEach(btn => 
        btn.addEventListener('click', () => toggleBlock(btn.dataset.id, false)));
      tableBody.querySelectorAll('.delete-btn').forEach(btn => 
        btn.addEventListener('click', () => deleteUser(btn.dataset.id)));

    } catch (err) { toast.error('Failed to load users.'); }
  };

  /**
   * Block/Unblock User
   */
  const toggleBlock = async (id, block) => {
    try {
      if (block) await api.post(`/admin/users/${id}/block`);
      else await api.post(`/admin/users/${id}/unblock`);
      toast.success(block ? 'User blocked.' : 'User unblocked.');
      loadUsers(searchInput.value);
    } catch (err) { toast.error('Operation failed.'); }
  };

  /**
   * Delete User
   */
  const deleteUser = async (id) => {
    if (!confirm('Permanently delete this user? All their data will be removed.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted.');
      loadUsers(searchInput.value);
    } catch (err) { toast.error('Delete failed.'); }
  };

  searchInput.addEventListener('input', (e) => loadUsers(e.target.value));

  // Init
  loadUsers();
});
