/**
 * admin/login.js — Admin Panel Login logic
 */
import auth  from '../../frontend/js/auth.js';
import toast from '../../frontend/js/toast.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    const submitBtn = document.getElementById('login-submit');

    // If already logged in as admin, redirect to admin index
    const user = auth.getUser();
    if (user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'super')) {
        window.location.href = 'index.html';
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email    = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Using the specialized adminLogin endpoint in auth service
            await auth.adminLogin({ email, password });
            toast.success('Admin authorized! Accessing dashboard...');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } catch (err) {
            toast.error(err.message || 'Verification failed. Admin access denied.');
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });
});
