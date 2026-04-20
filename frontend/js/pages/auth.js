export async function AuthPage() {
    const response = await fetch('html/auth.html');
    const html = await response.text();

    // Показываем нужную форму в зависимости от URL
    const currentPath = window.location.hash.slice(1) || '/';
    const isRegisterView = currentPath === '/register';

    // Создаем временный div для манипуляций с HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const loginForm = doc.querySelector('#login-form');
    const registerForm = doc.querySelector('#register-form');

    if (loginForm) loginForm.style.display = isRegisterView ? 'none' : 'block';
    if (registerForm) registerForm.style.display = isRegisterView ? 'block' : 'none';

    return doc.body.innerHTML;
}