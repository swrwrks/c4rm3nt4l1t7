console.log('>>> App.js: Старт');

import { Router } from './router.js';
import { updateAuthLink, login } from './auth.js';

// Импорт страниц
import { HomePage } from './pages/home.js';
import { CatalogPage } from './pages/catalog.js';
import { AboutPage } from './pages/about.js';
import { AuthPage } from './pages/auth.js';
import { ProfilePage } from './pages/profile.js';
import { NotFoundPage } from './pages/404.js';

// Новые страницы
import { FavoritesPage } from './pages/favorites.js';
import { RequestsPage } from './pages/requests.js';
import { SettingsPage } from './pages/settings.js';

console.log('>>> App.js: Все страницы импортированы');

const routes = {
    '/': HomePage,
    '/catalog': CatalogPage,
    '/about': AboutPage,
    '/auth': AuthPage,
    '/login': AuthPage,
    '/register': AuthPage,
    '/profile': ProfilePage,
    '/favorites': FavoritesPage,
    '/requests': RequestsPage,
    '/settings': SettingsPage,
    '/404': NotFoundPage
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('>>> App.js: DOM загружен');
    const router = new Router(routes);
    router.init();
    updateAuthLink();

    // Бургер-меню
    const burgerBtn = document.querySelector('.burger-btn');
    const navMenu = document.querySelector('.nav-menu');

    burgerBtn?.addEventListener('click', () => {
        navMenu?.classList.toggle('active');
    });
});

// Слушатель форм
document.addEventListener('submit', async (e) => {
    if (e.target.id === 'login-form') {
        e.preventDefault();
        const email = document.getElementById('login-email')?.value;
        if (email) login({ name: email.split('@')[0], email }, 'mock_token');
    }
    if (e.target.id === 'register-form') {
        e.preventDefault();
        const name = document.getElementById('register-name')?.value;
        const email = document.getElementById('register-email')?.value;
        if (name && email) login({ name, email }, 'mock_token');
    }
});