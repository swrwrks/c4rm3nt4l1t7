export class Router {
    constructor(routes) {
        this.routes = routes;
        this.appContainer = document.getElementById('app');
    }

    async handleLocation() {
        const path = window.location.hash.slice(1) || '/';
        const renderPage = this.routes[path] || this.routes['/404'];

        if (this.appContainer) {
            try {
                const html = await renderPage();
                this.appContainer.innerHTML = html;
                this.highlightActiveLink(path);
                this.executeInlineScripts();
            } catch (error) {
                console.error('Error loading page:', error);
                this.appContainer.innerHTML = '<h1>Ошибка загрузки страницы</h1>';
            }
        }
    }

    // Выполняем inline скрипты из HTML файлов
    executeInlineScripts() {
        const scripts = this.appContainer.querySelectorAll('script');
        scripts.forEach(oldScript => {
            const newScript = document.createElement('script');
            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            document.body.appendChild(newScript);
            oldScript.remove();
        });
    }

    highlightActiveLink(currentPath) {
        document.querySelectorAll('.nav-menu a[data-link]').forEach(link => {
            const linkPath = link.getAttribute('href').replace('#', '');
            link.classList.toggle('active', linkPath === currentPath);
        });
    }

    navigate(path) {
        window.location.hash = path;
    }

    init() {
        window.addEventListener('hashchange', () => this.handleLocation());

        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-link]');
            if (link) {
                e.preventDefault();
                const targetPath = link.getAttribute('href').replace('#', '');
                this.navigate(targetPath);
            }
        });

        this.handleLocation();
    }
}