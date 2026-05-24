export async function html() {
    return (await fetch('html/settings.html')).text();
}

export function init() {
    const user = JSON.parse(localStorage.getItem('bibobavto_user') || '{}');
    document.getElementById('set-phone').value = user.phone || '';

    document.getElementById('settings-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPhone = document.getElementById('set-phone').value.trim();
        const newPass = document.getElementById('set-password').value.trim();

        // Обновляем локально
        if (newPhone) user.phone = newPhone;

        // ⚠️ В реальном проекте здесь нужен fetch к backend: PUT /users/me
        // Сейчас сохраняем в localStorage для демонстрации
        localStorage.setItem('bibobavto_user', JSON.stringify(user));

        if (newPass) {
            alert('Пароль изменён! (Требуется backend endpoint для сохранения)');
        } else {
            alert('Настройки сохранены!');
        }

        window.location.hash = '#/profile';
    });
}