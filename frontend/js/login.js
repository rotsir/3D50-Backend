/**
 * login.js — Login page logic
 */
import auth  from './auth.js';
import toast from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const submitBtn = document.getElementById('login-submit');

  if (auth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      await auth.login({ email, password });
      toast.success('Welcome back! Redirecting...');
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        window.location.href = params.get('redirect') || '/';
      }, 1500);
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.');
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
});
