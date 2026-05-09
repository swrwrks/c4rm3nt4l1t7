export async function html() {
    return (await fetch('html/auth.html')).text();
}

export function init() {
    const isReg = window.location.hash === '#/register';
    const loginBox = document.getElementById('login-form-container');
    const registerBox = document.getElementById('register-form-container');

    if (loginBox && registerBox) {
        if (isReg) {
            // Показываем регистрацию, скрываем вход
            loginBox.style.display = 'none';
            registerBox.style.display = 'block';
            // Прокрутка к началу
            registerBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Показываем вход, скрываем регистрацию
            loginBox.style.display = 'block';
            registerBox.style.display = 'none';
            // Прокрутка к началу
            loginBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}