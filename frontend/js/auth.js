/**
 * Authentication JavaScript
 * Handles login and registration
 */

// Use relative URL for Docker deployment (nginx will proxy to backend)
const API_BASE_URL = '/api';

// Check if user is already logged in
// Uncomment the code below if you want to auto-redirect logged-in users to dashboard
// window.addEventListener('DOMContentLoaded', () => {
//     const token = localStorage.getItem('token');
//     if (token && window.location.pathname === '/') {
//         window.location.href = '/dashboard';
//     }
// });

// Show alert message
function showAlert(containerId, message, type = 'success') {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

// Handle Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const userType = document.getElementById('userType')?.value || 'student';
        
        try {
            const endpoint = userType === 'admin' ? '/auth/admin/login' : '/auth/login';
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                showAlert('alertContainer', errorData.error || 'Login failed', 'danger');
                return;
            }
            
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userType === 'admin' ? data.admin : data.student));
            localStorage.setItem('role', userType === 'admin' ? 'admin' : 'student');
            showAlert('alertContainer', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } catch (error) {
            showAlert('alertContainer', 'Network error. Please try again.', 'danger');
            console.error('Login error:', error);
        }
    });
}

// Handle Registration Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('name', document.getElementById('name').value);
        formData.append('rollNumber', document.getElementById('rollNumber').value);
        formData.append('email', document.getElementById('email').value);
        formData.append('password', document.getElementById('password').value);
        
        const photoFile = document.getElementById('photo').files[0];
        if (photoFile) {
            formData.append('photo', photoFile);
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                showAlert('alertContainer', errorData.error || 'Registration failed', 'danger');
                return;
            }
            
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.student));
            localStorage.setItem('role', 'student');
            showAlert('alertContainer', 'Registration successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } catch (error) {
            showAlert('alertContainer', 'Network error. Please try again.', 'danger');
            console.error('Registration error:', error);
        }
    });
}

