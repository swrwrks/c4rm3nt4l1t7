export async function html() {
    return (await fetch('html/profile.html')).text();
}

export function init() {
    console.log('Профиль открыт');

    const user = JSON.parse(localStorage.getItem('bibobavto_user') || '{}');

    if (!user.username) {
        window.location.hash = '#/auth';
        return;
    }

    document.getElementById('p-username').textContent = user.username || '—';
    document.getElementById('p-id').textContent = user.user_id || '—';

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('bibobavto_token');
            localStorage.removeItem('bibobavto_user');
            window.location.hash = '#/';
        });
    }
}