import { startRouter } from './router.js';
import { updateAuthLink } from './auth.js';

import * as home from './pages/home.js';
import * as catalog from './pages/catalog.js';
import * as about from './pages/about.js';
import * as auth from './pages/auth.js';
import * as profile from './pages/profile.js';
import * as favorites from './pages/favorites.js';
import * as settings from './pages/settings.js';
import * as notFound from './pages/404.js';


const routes = {
    '/': home,
    '/catalog': catalog,
    '/about': about,
    '/auth': auth,
    '/login': auth,
    '/profile': profile,
    '/favorites': favorites,
    '/settings': settings,
    '/404': notFound
};

window.updateAuthLink = updateAuthLink;
document.addEventListener('DOMContentLoaded', () => {
    startRouter(routes);
    updateAuthLink();
});

document.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (e.target.id === 'login-form') {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const { login } = await import('./auth.js');
            await login(username, password);
        } catch (error) {
            alert(error.message);
        }
    }
    if (e.target.id === 'register-form') {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value || null;
        const password = document.getElementById('register-password').value;

        try {
            const { register } = await import('./auth.js');
            await register(username, password, email, phone);
        } catch (error) {
            alert(error.message);
        }
    }
});