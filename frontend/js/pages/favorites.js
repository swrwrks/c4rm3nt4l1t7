export async function html() {
    return (await fetch('html/favorites.html')).text();
}

export async function init() {
    const listEl = document.getElementById('favorites-list');
    const emptyEl = document.getElementById('favorites-empty');

    const token = localStorage.getItem('bibobavto_token');
    if (!token) {
        if (listEl) listEl.innerHTML = '<p style="text-align:center; padding:2rem;">Пожалуйста, войдите в аккаунт</p>';
        if (emptyEl) emptyEl.style.display = 'none';
        return;
    }

    if (listEl) {
        listEl.innerHTML = '<p style="text-align:center; padding:1rem;">Загрузка...</p>';
        listEl.style.display = 'block';
    }
    if (emptyEl) emptyEl.style.display = 'none';

    try {
        const res = await fetch('http://localhost:8000/users/favorites/my', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Ошибка загрузки избранного');

        const myFavorites = await res.json();

        if (listEl) listEl.innerHTML = '';

        if (myFavorites.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            if (listEl) listEl.style.display = 'none';
        } else {
            if (emptyEl) emptyEl.style.display = 'none';
            if (listEl) {
                listEl.style.display = 'flex';
                listEl.style.flexDirection = 'column';
                listEl.style.gap = '0.8rem';
            }

            myFavorites.forEach(car => {
                const div = document.createElement('div');
                div.className = 'fav-card-real';
                const priceFormatted = new Intl.NumberFormat('ru-RU').format(car.price);

                div.innerHTML = `
                    <div class="fav-card-info">
                        <h4 class="fav-car-model">${car.model}</h4>
                        <p class="fav-car-year">${car.year} г. • ${car.color} • ${car.mileage?.toLocaleString() || 'N/A'} км</p>
                        <div class="fav-car-price">${priceFormatted} ₽</div>
                    </div>
                    <button class="btn-remove-fav" data-id="${car.id}">✕ Удалить</button>
                `;
                listEl.appendChild(div);
            });

            listEl.querySelectorAll('.btn-remove-fav').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const carId = parseInt(e.target.dataset.id);
                    await removeFromFavorites(carId);
                });
            });
        }

    } catch (error) {
        console.error(error);
        if (listEl) listEl.innerHTML = '<p style="color:red; text-align:center;">Ошибка загрузки данных.</p>';
        if (emptyEl) emptyEl.style.display = 'none';
    }
}

async function removeFromFavorites(carId) {
    const token = localStorage.getItem('bibobavto_token');

    try {
        const response = await fetch(`http://localhost:8000/users/favorites/toggle/${carId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Ошибка при удалении');

        const result = await response.json();
        const storedUser = JSON.parse(localStorage.getItem('bibobavto_user') || '{}');
        storedUser.favorites = result.favorites;
        localStorage.setItem('bibobavto_user', JSON.stringify(storedUser));

        init();

    } catch (error) {
        console.error(error);
        alert('Не удалось удалить из избранного');
    }
}