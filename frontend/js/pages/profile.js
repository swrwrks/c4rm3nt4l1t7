export async function html() {
    return (await fetch('html/profile.html')).text();
}

export function init() {
    const user = JSON.parse(localStorage.getItem('bibobavto_user') || '{}');
    if (!user.username) {
        window.location.hash = '#/auth';
        return;
    }

    document.getElementById('p-username').textContent = user.username;
    document.getElementById('p-id').textContent = user.user_id || '—';
    document.getElementById('p-email').textContent = user.email || 'Не указан';
    document.getElementById('p-phone').textContent = user.phone || 'Не указан';

    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('bibobavto_token');
        localStorage.removeItem('bibobavto_user');
        window.location.hash = '#/';
    });
}