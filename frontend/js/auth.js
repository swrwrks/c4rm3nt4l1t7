const AUTH_KEY = 'bibobavto_user';
const TOKEN_KEY = 'bibobavto_token';

export function isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) !== null;
}

export function getCurrentUser() {
    const user = localStorage.getItem(AUTH_KEY);
    return user ? JSON.parse(user) : null;
}

export function updateAuthLink() {
    const authLink = document.getElementById('auth-link');
    if (!authLink) return;

    if (isAuthenticated()) {
        const user = getCurrentUser();
        authLink.href = '#/profile';
        authLink.textContent = user.name || 'Профиль';
    } else {
        authLink.href = '#/auth';
        authLink.textContent = 'Вход / Регистрация';
    }
}

export function login(userData, token) {
    console.log('>>> Auth.js: Выполняется login...');
    localStorage.setItem(AUTH_KEY, JSON.stringify(userData));
    if (token) localStorage.setItem(TOKEN_KEY, token);
    updateAuthLink();
    window.location.hash = '#/profile';
}

export function logout() {
    console.log('>>> Auth.js: Выполняется logout...');
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(TOKEN_KEY);
    updateAuthLink();
    window.location.hash = '#/';
}