import { isAuthenticated } from '../auth.js';

// Те же данные, что и в каталоге
const carsData = [
    { id: 1, brand: 'BMW', model: 'X5', year: 2023, price: 8500000, color: 'Черный' },
    { id: 2, brand: 'Mercedes', model: 'GLE', year: 2022, price: 9200000, color: 'Белый' },
    { id: 3, brand: 'Audi', model: 'Q7', year: 2024, price: 10500000, color: 'Серый' },
    { id: 4, brand: 'Toyota', model: 'Camry', year: 2021, price: 3200000, color: 'Синий' },
    { id: 5, brand: 'BMW', model: '3 Series', year: 2020, price: 2800000, color: 'Черный' },
    { id: 6, brand: 'Mercedes', model: 'C-Class', year: 2022, price: 4100000, color: 'Белый' }
];

export async function html() {
    if (!isAuthenticated()) {
        window.location.hash = '#/login';
        return '';
    }
    return (await fetch('html/favorites.html')).text();
}

export function init() {
    const list = document.getElementById('favorites-list');
    const noFavs = document.getElementById('no-favorites');

    if (!list) return;

    // Получаем ID избранных авто
    const favIds = JSON.parse(localStorage.getItem('bibobavto_favorites') || '[]');

    // Если пусто
    if (favIds.length === 0) {
        list.innerHTML = '';
        if (noFavs) noFavs.style.display = 'block';
        return;
    }

    if (noFavs) noFavs.style.display = 'none';

    // Фильтруем машины, которые есть в избранном
    const favCars = carsData.filter(car => favIds.includes(car.id));

    // Форматирование цены
    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    // Отрисовка
    list.innerHTML = favCars.map(car => `
        <div class="favorite-item">
            <div class="fav-car-info">
                <h4>${car.brand} ${car.model}</h4>
                <p>${car.year} г. • ${car.color}</p>
                <div class="fav-price">${formatPrice(car.price)}</div>
            </div>
            <button class="btn-remove" data-id="${car.id}">Удалить</button>
        </div>
    `).join('');

    // Обработка удаления
    document.querySelectorAll('.btn-remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = Number(e.target.dataset.id);
            let favs = JSON.parse(localStorage.getItem('bibobavto_favorites') || '[]');
            favs = favs.filter(fId => fId !== id);
            localStorage.setItem('bibobavto_favorites', JSON.stringify(favs));
            init(); // Перерисовать список
        });
    });
}