export async function html() {
    return (await fetch('html/catalog.html')).text();
}

export function init() {
    const grid = document.getElementById('catalog-grid');
    const applyBtn = document.getElementById('apply-btn');
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');

    let allCars = [];
    let allBrands = [];
    let filteredCars = [];

    // 🔹 Настройки пагинации
    const ITEMS_PER_PAGE = 6;
    let currentPage = 1;

    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    function getBrandName(brandId) {
        const brand = allBrands.find(b => b.id === brandId);
        return brand ? brand.name : 'Неизвестно';
    }

    // 🔹 Отрисовка карточек (только текущая страница)
    function renderCars(cars, page = 1) {
        if (!grid) return;

        if (!cars || cars.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; padding:2rem; color:#888;">Ничего не найдено</p>';
            pagination.style.display = 'none';
            return;
        }

        // Вычисляем пагинацию
        const totalPages = Math.ceil(cars.length / ITEMS_PER_PAGE);
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageCars = cars.slice(startIndex, endIndex);

        const favs = JSON.parse(localStorage.getItem('bibobavto_favorites') || '[]');

        grid.innerHTML = pageCars.map(car => {
            const isFav = favs.includes(car.id);
            const brandName = getBrandName(car.brand_id);

            return `
                <div class="car-card">
                    <div class="car-placeholder">${brandName} ${car.model}</div>
                    <div class="car-details">
                        <h4>${brandName} ${car.model}</h4>
                        <p>${car.year} г. • ${car.color} • ${car.mileage?.toLocaleString() || 'N/A'} км</p>
                        <div class="car-price">${formatPrice(car.price)}</div>
                        <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${car.id}">
                            ${isFav ? 'В избранном' : 'В избранное'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Навешиваем события на кнопки избранного
        document.querySelectorAll('.btn-fav').forEach(btn => {
            btn.addEventListener('click', () => window.toggleFav(Number(btn.dataset.id)));
        });

        // 🔹 Обновляем пагинацию
        if (totalPages > 1) {
            pagination.style.display = 'flex';
            pageInfo.textContent = `Страница ${page} из ${totalPages}`;
            prevBtn.disabled = page === 1;
            nextBtn.disabled = page === totalPages;
        } else {
            pagination.style.display = 'none';
        }
    }

    // 🔹 Фильтрация + сброс на 1 страницу
    function filterCars(filters) {
        currentPage = 1; // Сброс при новом фильтре

        let filtered = [...allCars];

        if (filters.brand) {
            const brandObj = allBrands.find(b => b.name === filters.brand);
            if (brandObj) filtered = filtered.filter(car => car.brand_id === brandObj.id);
        }
        if (filters.minPrice) filtered = filtered.filter(car => car.price >= filters.minPrice);
        if (filters.maxPrice) filtered = filtered.filter(car => car.price <= filters.maxPrice);
        if (filters.year) filtered = filtered.filter(car => car.year === filters.year);
        if (filters.sort === 'price_asc') filtered.sort((a, b) => a.price - b.price);
        if (filters.sort === 'price_desc') filtered.sort((a, b) => b.price - a.price);

        filteredCars = filtered;
        renderCars(filteredCars, currentPage);
    }

    // 🔹 Загрузка данных с Backend
    async function loadCarsFromBackend() {
        if (!grid) return;
        grid.innerHTML = '<p style="text-align:center; padding:2rem;">Загрузка...</p>';

        try {
            const [carsRes, brandsRes] = await Promise.all([
                fetch('http://localhost:8000/cars/'),
                fetch('http://localhost:8000/brands/')
            ]);

            if (!carsRes.ok) throw new Error('Ошибка загрузки каталога');

            allCars = await carsRes.json();
            allBrands = brandsRes.ok ? await brandsRes.json() : [];

            // Заполняем select марок
            const brandSelect = document.getElementById('filter-brand');
            if (brandSelect && allBrands.length > 0) {
                const defaultOption = brandSelect.options[0];
                brandSelect.innerHTML = '';
                brandSelect.appendChild(defaultOption);

                allBrands.forEach(brand => {
                    const option = document.createElement('option');
                    option.value = brand.name;
                    option.textContent = brand.name;
                    brandSelect.appendChild(option);
                });
            }

            filteredCars = [...allCars];
            renderCars(filteredCars, currentPage);
        } catch (e) {
            console.error('Ошибка загрузки:', e);
            grid.innerHTML = `
                <p style="text-align:center; padding:2rem; color:#dc3545;">
                    Не удалось загрузить каталог.<br>
                    Убедись, что backend запущен на порту 8000 и CORS настроен.
                </p>
            `;
        }
    }

    // 🔹 Обработчики пагинации
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderCars(filteredCars, currentPage);
                grid.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderCars(filteredCars, currentPage);
                grid.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    //  Обработчик кнопки "Применить"
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const filters = {
                brand: document.getElementById('filter-brand').value || null,
                minPrice: document.getElementById('filter-min').value ? Number(document.getElementById('filter-min').value) : null,
                maxPrice: document.getElementById('filter-max').value ? Number(document.getElementById('filter-max').value) : null,
                year: document.getElementById('filter-year').value ? Number(document.getElementById('filter-year').value) : null,
                sort: document.getElementById('filter-sort').value || 'default'
            };
            filterCars(filters);
        });
    }

    // 🔹 Глобальная функция для избранного
    window.toggleFav = (id) => {
        let favs = JSON.parse(localStorage.getItem('bibobavto_favorites') || '[]');
        favs = favs.includes(id) ? favs.filter(f => f !== id) : [...favs, id];
        localStorage.setItem('bibobavto_favorites', JSON.stringify(favs));

        // Обновляем UI без полной перерисовки
        const btn = document.querySelector(`.btn-fav[data-id="${id}"]`);
        if (btn) {
            const isFav = favs.includes(id);
            btn.classList.toggle('active', isFav);
            btn.textContent = isFav ? 'В избранном' : 'В избранное';
        }
    };

    // Первая загрузка
    loadCarsFromBackend();
}