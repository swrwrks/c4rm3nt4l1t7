import { isAuthenticated, logout } from '../auth.js';

// 1. Загрузка и проверка доступа
export async function html() {
    if (!isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }
    return (await fetch('html/profile.html')).text();
}

// 2. Инициализация после вставки в DOM
export function init() {
    const user = JSON.parse(localStorage.getItem('bibobavto_user'));
    if (!user) return;

    document.getElementById('profile-username').textContent = user.username;
    document.getElementById('profile-id').textContent = user.user_id;

    // 🔹 Отображаем почту, если она сохранена
    const emailEl = document.getElementById('profile-email');
    if (emailEl) emailEl.textContent = user.email || 'Не указана';

    document.getElementById('logout-btn')?.addEventListener('click', logout);
}