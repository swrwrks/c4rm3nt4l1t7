import { isAuthenticated } from '../auth.js';

export async function html() {
    if (!isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }
    return (await fetch('html/requests.html')).text();
}

export function init() {
    document.getElementById('create-request-btn')?.addEventListener('click', () => {
        alert('Заявка создана (демо)');
    });
}