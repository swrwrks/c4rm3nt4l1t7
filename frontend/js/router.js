export function startRouter(routes) {
    async function handleLocation() {
        let hash = window.location.hash.slice(1);
        if (!hash) hash = '/';

        const route = routes[hash];
        const app = document.getElementById('app');

        if (!route) {
            const notFound = routes['/404'];
            if (notFound) {
                app.innerHTML = await notFound.html();
                notFound.init();
            }
            return;
        }

        try {

            const pageHtml = await route.html();
            app.innerHTML = pageHtml;

            if (route.init) {
                route.init();
            }

            if (window.updateAuthLink) {
                window.updateAuthLink();
            }
        } catch (error) {
            console.error('Ошибка загрузки страницы:', error);
            app.innerHTML = '<h1>Ошибка загрузки</h1>';
        }
    }

    window.addEventListener('hashchange', handleLocation);

    handleLocation();
}