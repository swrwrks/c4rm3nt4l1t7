const API_BASE = 'http://localhost:8000';
const TOKEN_KEY = 'bibobavto_token';
const USER_KEY = 'bibobavto_user';

// 🔹 Декодирование JWT токена (без проверки подписи, только для чтения данных на клиенте)
function decodeJWT(token) {
    try {
        const payload = token.split('.')[1];
        // atob декодирует base64 строку в читаемый JSON
        return JSON.parse(atob(payload));
    } catch (error) {
        console.error('Ошибка декодирования JWT:', error);
        return null;
    }
}

// 🔹 ВХОД В СИСТЕМУ
export async function login(username, password) {
    // Backend использует OAuth2PasswordRequestForm, поэтому отправляем form-data
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Ошибка входа');
    }

    const data = await res.json();

    // 1. Сохраняем токен
    localStorage.setItem(TOKEN_KEY, data.access_token);

    // 2. Декодируем и сохраняем данные пользователя
    const payload = decodeJWT(data.access_token);
    if (payload) {
        localStorage.setItem(USER_KEY, JSON.stringify({
            username: payload.sub,
            user_id: payload.user_id,
            email: payload.email || null,    // Будет null, если backend не кладёт email в токен
            phone: payload.phone || null     // Будет null, если backend не кладёт phone в токен
        }));
    }

    // 3. Мгновенно обновляем интерфейс (кнопку в шапке)
    if (typeof window.updateAuthLink === 'function') {
        window.updateAuthLink();
    }

    // 4. Перенаправляем на главную
    window.location.hash = '#/';
}

// 🔹 РЕГИСТРАЦИЯ
export async function register(username, password, email, phone = null) {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username,
            password,
            email,
            phone: phone || null
        })
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Ошибка регистрации');
    }

    // Успешная регистрация: переключаем на форму входа
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');

    if (loginContainer && registerContainer) {
        registerContainer.classList.add('hidden');
        loginContainer.classList.remove('hidden');
    }

    alert('Регистрация успешна! Теперь войдите.');
}

// 🔹 ВЫХОД ИЗ СИСТЕМЫ
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Сбрасываем кнопку в шапке
    const btn = document.getElementById('auth-link');
    if (btn) {
        btn.textContent = 'Вход / Регистрация';
        btn.href = '#/auth';
        btn.classList.remove('auth-user');
        btn.classList.add('btn');
    }

    window.location.hash = '#/';
}

// 🔹 ПРОВЕРКА АВТОРИЗАЦИИ
export function isAuthenticated() {
    return localStorage.getItem(TOKEN_KEY) !== null;
}

// 🔹 ПОЛУЧЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ
export function getCurrentUser() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const payload = decodeJWT(token);
    return {
        username: payload?.sub,
        user_id: payload?.user_id,
        email: payload?.email,
        phone: payload?.phone
    };
}

// 🔹 ОБНОВЛЕНИЕ КНОПКИ В ШАПКЕ
export function updateAuthLink() {
    const btn = document.getElementById('auth-link');
    if (!btn) return;

    if (isAuthenticated()) {
        const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
        btn.textContent = user.username || 'Профиль';
        btn.href = '#/profile';
        btn.classList.add('auth-user');
        btn.classList.remove('btn');
    } else {
        btn.textContent = 'Вход / Регистрация';
        btn.href = '#/auth';
        btn.classList.remove('auth-user');
        btn.classList.add('btn');
    }
}

// 🔹 ЗАЩИТА МАРШРУТОВ
export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.hash = '#/auth';
        return false;
    }
    return true;
}