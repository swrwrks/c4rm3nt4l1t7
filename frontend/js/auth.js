// 🔴 НАСТРОЙКА: true = тестирование без бэкенда, false = работа с реальным API
const USE_MOCK = true;

const TOKEN_KEY = 'bibobavto_token';
const USER_KEY = 'bibobavto_user';

// Тестовая база пользователей
const mockDB = [
    { username: 'admin', password: '123', id: 1 },
    { username: 'test', password: '123', id: 2 }
];

// Декодирование JWT токена
function decodeJWT(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = decodeURIComponent(atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
            .split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        return JSON.parse(decoded);
    } catch {
        return null;
    }
}

// Генерация тестового токена
function createMockToken(user) {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
        sub: user.username,
        user_id: user.id,
        exp: Date.now() / 1000 + 3600
    }));
    return `${header}.${payload}.mock`;
}

// Проверка авторизации
export function isAuthenticated() {
    return !!localStorage.getItem(TOKEN_KEY);
}

// Получение текущего пользователя
export function getCurrentUser() {
    const cached = localStorage.getItem(USER_KEY);
    if (cached) return JSON.parse(cached);

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    const payload = decodeJWT(token);
    if (payload?.sub) {
        const user = { username: payload.sub, user_id: payload.user_id || payload.id };
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        return user;
    }
    return null;
}

// Вход в систему
export async function login(username, password) {
    try {
        if (USE_MOCK) {
            await new Promise(r => setTimeout(r, 400));
            const user = mockDB.find(u => u.username === username && u.password === password);
            if (!user) throw new Error('Неверный логин или пароль');

            localStorage.setItem(TOKEN_KEY, createMockToken(user));
            localStorage.setItem(USER_KEY, JSON.stringify({ username: user.username, user_id: user.id }));
        } else {
            const form = new URLSearchParams();
            form.append('username', username);
            form.append('password', password);

            const res = await fetch('http://localhost:8000/auth/login', {
                method: 'POST',
                body: form // Браузер сам поставит правильный Content-Type для form-data
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Ошибка входа');
            }

            const data = await res.json();
            localStorage.setItem(TOKEN_KEY, data.access_token);

            const payload = decodeJWT(data.access_token);
            if (payload) {
                localStorage.setItem(USER_KEY, JSON.stringify({
                    username: payload.sub,
                    user_id: payload.user_id,
                    email: payload.email
                }));
            }
        }

        updateAuthLink();
        window.location.hash = '#/profile';
    } catch (e) {
        alert(e.message);
    }
}

// Обновленная функция регистрации
export async function register(username, email, password) {
    try {
        if (USE_MOCK) {
            await new Promise(r => setTimeout(r, 400));
            if (mockDB.some(u => u.username === username)) throw new Error('Пользователь уже существует');

            mockDB.push({ username, password, email, id: mockDB.length + 1 });

            // 🔹 Добавь эти строки ПЕРЕД login():
            localStorage.setItem('bibobavto_user', JSON.stringify({
                username: username,
                user_id: mockDB.length,
                email: email  // ← Сохраняем email
            }));

            await login(username, password);
        } else {
            const res = await fetch('http://localhost:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Отправляем email вместе с остальными данными
                body: JSON.stringify({ username, email, password })
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Ошибка регистрации');
            }
        }
        // После успешной регистрации сразу логиним пользователя
        await login(username, password);
    } catch (e) {
        alert(e.message);
    }
}


// Выход из системы
export function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    updateAuthLink();
    window.location.hash = '#/';
}

// Обновление кнопки в шапке
export function updateAuthLink() {
    const link = document.getElementById('auth-link');
    if (!link) return;

    if (isAuthenticated()) {
        const user = getCurrentUser();
        link.href = '#/profile';
        link.textContent = user?.username || 'Профиль';
    } else {
        link.href = '#/login';
        link.textContent = 'Вход';
    }
}