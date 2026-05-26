const API_URL = 'http://localhost:8000';
const TOKEN_KEY = 'bibobavto_token';
const USER_KEY = 'bibobavto_user';

function decodeToken(token) {
    try {
        const payload = token.split('.')[1];
        return JSON.parse(atob(payload));
    } catch (e) {
        console.error('Ошибка при чтении токена:', e);
        return null;
    }
}

export async function login(username, password) {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось войти');
    }

    const data = await response.json();

    localStorage.setItem(TOKEN_KEY, data.access_token);

    const payload = decodeToken(data.access_token);
    if (payload) {
        localStorage.setItem(USER_KEY, JSON.stringify({
            username: payload.user_name || payload.username || payload.sub,
            user_id: payload.user_id,
            email: payload.email || null,
            phone: payload.phone || null,
            favorites: payload.favorites || []
        }));
    }

    if (window.updateAuthLink) {
        window.updateAuthLink();
    }
    window.location.hash = '#/';
}

export async function register(username, password, email, phone = null) {
    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user_name: username,
            username: username,
            password: password,
            email: email,
            phone: phone
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Ошибка регистрации');
    }

    const loginForm = document.getElementById('login-form-container');
    const registerForm = document.getElementById('register-form-container');

    if (loginForm && registerForm) {
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }

    alert('Регистрация прошла успешно! Теперь войдите.');
}

export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    if (window.updateAuthLink) {
        window.updateAuthLink();
    }
    window.location.hash = '#/';
}

export function isAuthenticated() {
    return localStorage.getItem(TOKEN_KEY) !== null;
}

export function getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const payload = decodeToken(token);
    return {
        username: payload?.user_name || payload?.username || payload?.sub,
        user_id: payload?.user_id,
        email: payload?.email,
        phone: payload?.phone
    };
}

export function updateAuthLink() {
    const btn = document.getElementById('auth-link');
    if (!btn) return;

    if (isAuthenticated()) {
        const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
        btn.textContent = user.username || 'Профиль';
        btn.href = '#/profile';
        btn.classList.add('auth-user');
        btn.classList.remove('btn-primary');
    } else {
        btn.textContent = 'Вход / Регистрация';
        btn.href = '#/auth';
        btn.classList.remove('auth-user');
        btn.classList.add('btn-primary');
    }
}

export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.hash = '#/auth';
        return false;
    }
    return true;
}