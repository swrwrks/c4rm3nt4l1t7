import { Router } from './router.js';
import { updateAuthLink } from './auth.js';

// Импорты страниц
import * as home from './pages/home.js';
import * as catalog from './pages/catalog.js';
import * as about from './pages/about.js';
import * as auth from './pages/auth.js';
import * as profile from './pages/profile.js';
import * as favorites from './pages/favorites.js';
import * as notFound from './pages/404.js';

// Карта маршрутов
const routes = {
    '/': home,
    '/catalog': catalog,
    '/about': about,
    '/auth': auth,
    '/profile': profile,
    '/favorites': favorites,
    '/404': notFound
};

document.addEventListener('DOMContentLoaded', () => {
    new Router(routes).init();
    updateAuthLink();
});

// Глобальная обработка форм (вход / регистрация)
document.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (e.target.id === 'login-form') {
        const { login } = await import('./auth.js');
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        await login(username, password);
    }

    // Обновленная логика регистрации
    if (e.target.id === 'register-form') {
        const { register } = await import('./auth.js');
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value; // Читаем email
        const password = document.getElementById('register-password').value;

        // Передаем 3 аргумента
        await register(username, email, password);
    }
});