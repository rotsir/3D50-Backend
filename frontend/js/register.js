/**
 * register.js — Registration page logic
 */
import auth  from './auth.js';
import toast from './toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const submitBtn    = document.getElementById('register-submit');

  if (auth.isLoggedIn()) {
    window.location.href = 'dashboard.html';
  }

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const email    = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const terms   = document.getElementById('terms').checked;

    if (!terms) {
      toast.error('You must agree to the terms and conditions.');
      return;
    }

    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
      await auth.register({ username, email, password });
      toast.success('Account created! Welcome to 3D50.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1500);
    } catch (err) {
      toast.error(err.message || 'Registration failed. Full details: ' + JSON.stringify(err.errors || ''));
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });
});
