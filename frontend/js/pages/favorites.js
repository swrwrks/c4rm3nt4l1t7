import { isAuthenticated } from '../auth.js';

export async function html() {
    if (!isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }
    return (await fetch('html/favorites.html')).text();
}

export function init() {}