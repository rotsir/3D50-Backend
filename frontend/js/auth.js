/**
 * Auth Service — handles user sessions, storage, and state
 */
import api from './api.js';

const TOKEN_KEY = 'token';
const USER_KEY  = 'user';

export const auth = {
  /**
   * Register a new user
   * @param {object} data {username, email, password}
   */
  async register(data) {
    const res = await api.post('/auth/register', data);
    this.setSession(res.token, res.user);
    return res;
  },

  /**
   * Log in a user
   * @param {object} data {email, password}
   */
  async login(data) {
    const res = await api.post('/auth/login', data);
    this.setSession(res.token, res.user);
    return res;
  },

  /**
   * Log in an admin
   */
  async adminLogin(data) {
    const res = await api.post('/auth/admin/login', data);
    this.setSession(res.token, res.admin); 
    return res;
  },

  /**
   * Log out current user
   */
  /**
   * Log out current user
   */
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // Determine path back to root if in admin
    const isSubdir = window.location.pathname.includes('/admin/');
    window.location.href = isSubdir ? '../login.html' : 'login.html';
  },

  /**
   * Check if user is logged in (client-side check)
   */
  isLoggedIn() {
    return !!localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Get current user data from storage
   */
  getUser() {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Set session in local storage
   */
  setSession(token, user) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Sync current user with server
   */
  async sync() {
    if (!this.isLoggedIn()) return null;
    try {
      const { user } = await api.get('/auth/me');
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      return user;
    } catch (err) {
      if (err.status === 401) this.logout();
      return null;
    }
  },

  /**
   * Update UI based on auth state
   * (e.g., toggle login/user buttons in navbar)
   */
  updateUI() {
    const user = this.getUser();
    const guestCta = document.getElementById('nav-cta');
    const userNav  = document.getElementById('nav-user');
    const dashboardBtn = document.getElementById('nav-dashboard');

    if (user) {
      if (guestCta) guestCta.style.display = 'none';
      if (userNav)  userNav.style.display  = 'flex';
      
      // If admin, link to admin panel
      if (user.role === 'admin' || user.role === 'super_admin') {
         if (dashboardBtn) {
            dashboardBtn.textContent = 'Admin Panel';
            const isSubdir = window.location.pathname.includes('/admin/');
            dashboardBtn.href = isSubdir ? 'index.html' : 'admin/index.html';
         }
      }
    } else {
      if (guestCta) guestCta.style.display = 'flex';
      if (userNav)  userNav.style.display  = 'none';
    }
  }
};

// Initialize Navbar on load
document.addEventListener('DOMContentLoaded', () => {
  auth.updateUI();
  
  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => auth.logout());
  }
});

export default auth;
