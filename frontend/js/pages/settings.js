export async function html() {
    return (await fetch('html/settings.html')).text();
}

export function init() {
    console.log('Страница настроек загружена');

    const form = document.getElementById('settings-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Блокируем стандартную отправку формы

        const oldPassword = document.getElementById('old-password').value;
        const newPassword = document.getElementById('new-password').value;

        const token = localStorage.getItem('bibobavto_token');
        if (!token) {
            alert('Сначала войдите в аккаунт');
            window.location.hash = '#/auth';
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/users/password', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    old_password: oldPassword,
                    new_password: newPassword
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || 'Ошибка при смене пароля');
            }

            alert('Пароль успешно изменён');
            form.reset();

        } catch (error) {
            console.error(error);
            alert(error.message);
        }
    });
}