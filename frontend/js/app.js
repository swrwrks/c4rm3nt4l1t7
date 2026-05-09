import { Router } from './router.js';
import { updateAuthLink } from './auth.js';

// Импортируем ВСЕ страницы
import * as home from './pages/home.js';
import * as catalog from './pages/catalog.js';
import * as about from './pages/about.js';
import * as auth from './pages/auth.js';
import * as profile from './pages/profile.js';
import * as settings from './pages/settings.js';
import * as requests from './pages/requests.js';
import * as favorites from './pages/favorites.js';
import * as notFound from './pages/404.js';

// Карта маршрутов
const routes = {
    '/': home,
    '/catalog': catalog,
    '/about': about,
    '/login': auth,
    '/register': auth,
    '/profile': profile,
    '/settings': settings,
    '/requests': requests,
    '/favorites': favorites,
    '/404': notFound
};

document.addEventListener('DOMContentLoaded', () => {
    // Запускаем роутер
    new Router(routes).init();

    // Обновляем кнопку входа
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