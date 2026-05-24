export async function html() {
    return (await fetch('html/auth.html')).text();
}

export function init() {
    console.log('Auth page initialized');

    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');

    if (!loginContainer || !registerContainer) {
        console.error('Form containers not found!');
        return;
    }

    // Переключение на регистрацию
    const showRegisterLink = document.getElementById('show-register');
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginContainer.classList.add('hidden');
            registerContainer.classList.remove('hidden');
        });
    }

    // Переключение на вход
    const showLoginLink = document.getElementById('show-login');
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            registerContainer.classList.add('hidden');
            loginContainer.classList.remove('hidden');
        });
    }

    // Обработка формы входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const { login } = await import('../auth.js');
                await login(username, password);
            } catch (err) {
                alert(err.message);
            }
        });
    }

    // Обработка формы регистрации
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const phone = document.getElementById('register-phone').value;
            const password = document.getElementById('register-password').value;

            try {
                const { register } = await import('../auth.js');
                await register(username, password, email, phone);
            } catch (err) {
                alert(err.message);
            }
        });
    }
}