/**
 * dashboard.js — User Dashboard logic
 */
import api   from './api.js';
import auth  from './auth.js';
import toast from './toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  if (!auth.isLoggedIn()) {
    window.location.href = 'login.html?redirect=dashboard.html';
    return;
  }

  // Dashboard state
  let userData = auth.getUser();
  const userNameEl = document.getElementById('sidebar-username');
  const userEmailEl = document.getElementById('sidebar-email');
  const userAvatarEl = document.getElementById('sidebar-avatar');

  // Updating sidebar with user info
  const updateSidebar = () => {
    userNameEl.innerText = userData.username;
    userEmailEl.innerText = userData.email;
    userAvatarEl.innerText = userData.username[0].toUpperCase();
  };

  /**
   * Dashboard Tabs Switching
   */
  const tabs = document.querySelectorAll('.dashboard-nav-item[data-tab]');
  const tabContents = document.querySelectorAll('.dashboard-tab');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const activeTab = tab.dataset.tab;
      
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      tabContents.forEach(content => {
        content.style.display = content.id === `tab-${activeTab}` ? 'block' : 'none';
      });

      // Loading specific tab data if needed
      if (activeTab === 'downloads') loadDownloads();
      if (activeTab === 'reviews') loadMyReviews();
    });
  });

  /**
   * Load Overview Stats
   */
  const loadOverview = async () => {
    try {
      const { user } = await api.get('/auth/me');
      document.getElementById('stat-downloads').innerText = user.downloads_count || 0;
      document.getElementById('stat-reviews').innerText = user.reviews_count || 0;
      
      // Load recent activity (e.g., last 5 downloads)
      const { downloads } = await api.get('/downloads/my-downloads', { limit: 5 });
      const activityBody = document.getElementById('recent-activity-body');
      
      if (downloads.length === 0) {
        activityBody.innerHTML = '<tr><td colspan="3" class="text-center text-muted">No recent activity.</td></tr>';
      } else {
        activityBody.innerHTML = downloads.map(d => `
          <tr>
            <td><a href="/product.html?id=${d.product_id}" class="auth-link">${d.product_name}</a></td>
            <td>Downloaded Asset</td>
            <td>${new Date(d.downloaded_at).toLocaleDateString()}</td>
          </tr>
        `).join('');
      }
    } catch (err) { console.error(err); }
  };

  /**
   * Load Download History
   */
  const loadDownloads = async () => {
    const historyBody = document.getElementById('download-history-body');
    historyBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading...</td></tr>';

    try {
      const { downloads } = await api.get('/downloads/my-downloads');
      if (downloads.length === 0) {
        historyBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No downloads yet.</td></tr>';
        return;
      }

      historyBody.innerHTML = downloads.map(d => `
        <tr>
          <td><span class="font-weight-bold">${d.product_name}</span></td>
          <td>${(d.file_size_bytes / (1024*1024)).toFixed(2)} MB</td>
          <td>${new Date(d.downloaded_at).toLocaleDateString()}</td>
          <td>
            <a href="/product.html?id=${d.product_id}" class="btn btn-secondary btn-sm">Download Again</a>
          </td>
        </tr>
      `).join('');
    } catch (err) { toast.error('Failed to load downloads.'); }
  };

  /**
   * Load My Reviews
   */
  const loadMyReviews = async () => {
    const reviewsEl = document.getElementById('my-reviews-list');
    reviewsEl.innerHTML = '<p class="text-center">Loading...</p>';

    try {
      const { reviews } = await api.get('/reviews/my-reviews');
      if (reviews.length === 0) {
        reviewsEl.innerHTML = '<p class="text-muted text-center">You haven\'t written any reviews yet.</p>';
        return;
      }

      reviewsEl.innerHTML = reviews.map(r => `
        <div class="review-card">
          <div class="review-card__header">
            <span class="font-weight-bold">${r.product_name}</span>
            <span class="review-card__rating">${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span>
          </div>
          <p class="review-card__body">${r.body}</p>
          <div class="review-card__date">${new Date(r.created_at).toLocaleDateString()}</div>
        </div>
      `).join('');
    } catch (err) { toast.error('Failed to load your reviews.'); }
  };

  // Sign out
  document.getElementById('sidebar-logout').addEventListener('click', () => auth.logout());

  // Init
  updateSidebar();
  loadOverview();
});
