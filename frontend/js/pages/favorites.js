export async function html() {
    return (await fetch('html/favorites.html')).text();
}

export function init() {
    const favIds = JSON.parse(localStorage.getItem('bibobavto_favorites') || '[]');
    const listEl = document.getElementById('favorites-list');
    const emptyEl = document.getElementById('favorites-empty');

    listEl.innerHTML = '';

    if (favIds.length === 0) {
        emptyEl.classList.remove('hidden');
    } else {
        emptyEl.classList.add('hidden');
        favIds.forEach(id => {
            const div = document.createElement('div');
            div.className = 'fav-item-compact';
            div.innerHTML = `<span>🚗 Авто #${id}</span> <button class="btn-remove-sm" data-id="${id}">✕</button>`;
            listEl.appendChild(div);
        });

        listEl.querySelectorAll('.btn-remove-sm').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                const updated = favIds.filter(f => f !== id);
                localStorage.setItem('bibobavto_favorites', JSON.stringify(updated));
                init(); // Перерисовать
            });
        });
    }
}