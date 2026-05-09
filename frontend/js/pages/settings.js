import { isAuthenticated } from '../auth.js';

export async function html() {
    if (!isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }
    return (await fetch('html/settings.html')).text();
}

export function init() {
    document.getElementById('save-settings-btn')?.addEventListener('click', () => {
        alert('Настройки сохранены (демо)');
    });
}