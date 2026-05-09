export class Router {
    constructor(routes) {
        this.routes = routes;
        this.container = document.getElementById('app');
    }

    async handleLocation() {
        // Получаем путь из хеша (убираем #)
        const path = window.location.hash.slice(1) || '/';

        // Находим модуль страницы
        const pageModule = this.routes[path] || this.routes['/404'];

        try {
            // Проверяем, что модуль загружен и у него есть html()
            if (!pageModule || typeof pageModule.html !== 'function') {
                throw new Error('Страница не найдена или некорректна');
            }

            // Рендерим HTML
            this.container.innerHTML = await pageModule.html();

            // Подсвечиваем активную ссылку
            this.highlightActiveLink(path);

            // Инициализируем страницу (если есть функция init)
            if (typeof pageModule.init === 'function') {
                pageModule.init();
            }
        } catch (error) {
            console.error('Error loading page:', error);
            this.container.innerHTML = `
                <div class="card" style="text-align:center">
                    <h2>Ошибка загрузки</h2>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    highlightActiveLink(currentPath) {
        document.querySelectorAll('.nav-menu a[data-link]').forEach(link => {
            const linkPath = link.getAttribute('href').replace('#', '');
            link.classList.toggle('active', linkPath === currentPath);
        });
    }

    init() {
        // Обработка изменения хеша
        window.addEventListener('hashchange', () => this.handleLocation());

        // Перехват кликов по ссылкам
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-link]');
            if (link) {
                e.preventDefault();
                window.location.hash = link.getAttribute('href');
            }
        });

        // Первая загрузка
        this.handleLocation();
    }
}