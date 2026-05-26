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

    const ITEMS_PER_PAGE = 6;
    let currentPage = 1;

    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    }

    function getBrandName(brandId) {
        const brand = allBrands.find(b => b.id === brandId);
        return brand ? brand.name : 'Неизвестно';
    }

    function isAuthenticated() {
        return localStorage.getItem('bibobavto_token') !== null;
    }

    function getCurrentUser() {
        const user = localStorage.getItem('bibobavto_user');
        return user ? JSON.parse(user) : null;
    }

    function getFavLabel(count) {
        if (count === 1) return 'пользователь';
        if (count < 5) return 'пользователя';
        return 'пользователей';
    }

    function renderCars(cars, page = 1) {
        if (!grid) return;

        if (!cars || cars.length === 0) {
            grid.innerHTML = '<p style="text-align:center; width:100%; padding:2rem; color:#888;">Ничего не найдено</p>';
            if (pagination) pagination.style.display = 'none';
            return;
        }

        const totalPages = Math.ceil(cars.length / ITEMS_PER_PAGE);
        const startIndex = (page - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const pageCars = cars.slice(startIndex, endIndex);

        const user = getCurrentUser();
        const userFavorites = user?.favorites || [];

        grid.innerHTML = pageCars.map(car => {
            const isFav = userFavorites.includes(car.id);
            const brandName = getBrandName(car.brand_id);
            const favCount = car.favorites_count || 0;

            return `
                <div class="car-card" data-id="${car.id}">
                    <div class="car-details">
                        <h4>${brandName} ${car.model}</h4>
                        <p>${car.year} г. • ${car.color} • ${car.mileage?.toLocaleString() || 'N/A'} км</p>
                        <div class="car-price">${formatPrice(car.price)}</div>

                        <div class="fav-stats">
                            <span class="fav-icon">❤️</span>
                            <span class="fav-count">${favCount}</span>
                            <span class="fav-label">${getFavLabel(favCount)}</span>
                        </div>

                        <button class="btn-fav ${isFav ? 'active' : ''}" data-id="${car.id}">
                            ${isFav ? '✓ В избранном' : '+ В избранное'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        document.querySelectorAll('.btn-fav').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const carId = parseInt(btn.dataset.id);
                toggleFavorite(carId, btn);
            });
        });

        if (totalPages > 1) {
            if (pagination) {
                pagination.style.display = 'flex';
                pageInfo.textContent = `Страница ${page} из ${totalPages}`;
                if (prevBtn) prevBtn.disabled = page === 1;
                if (nextBtn) nextBtn.disabled = page === totalPages;
            }
        } else {
            if (pagination) pagination.style.display = 'none';
        }
    }

    async function toggleFavorite(carId, btnElement) {
        const token = localStorage.getItem('bibobavto_token');

        if (!token) {
            alert('Пожалуйста, войдите в аккаунт, чтобы добавлять в избранное');
            window.location.hash = '#/auth';
            return;
        }

        const user = getCurrentUser();
        const userFavorites = user?.favorites || [];
        const isAdding = !userFavorites.includes(carId);

        // Оптимистичное обновление интерфейса (счётчик меняется сразу)
        const countEl = btnElement.parentElement.querySelector('.fav-count');
        const labelEl = btnElement.parentElement.querySelector('.fav-label');

        if (countEl) {
            let count = parseInt(countEl.textContent) || 0;
            count = isAdding ? count + 1 : count - 1;
            countEl.textContent = count;
            if (labelEl) labelEl.textContent = getFavLabel(count);
        }

        // Обновляем состояние кнопки временно
        btnElement.classList.toggle('active');
        btnElement.textContent = isAdding ? '✓ В избранном' : '+ В избранное';

        try {
            const response = await fetch(`http://localhost:8000/users/favorites/toggle/${carId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Если ошибка, откатываем изменения
                if (countEl) {
                    let count = parseInt(countEl.textContent) || 0;
                    countEl.textContent = isAdding ? count - 1 : count + 1;
                    if (labelEl) labelEl.textContent = getFavLabel(parseInt(countEl.textContent));
                }
                btnElement.classList.toggle('active');
                btnElement.textContent = isAdding ? '+ В избранное' : '✓ В избранном';

                if (response.status === 401) {
                    throw new Error('Необходимо войти в систему заново');
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Ошибка сервера');
            }

            const result = await response.json();

            // Сохраняем обновленный список избранного
            const storedUser = JSON.parse(localStorage.getItem('bibobavto_user') || '{}');
            storedUser.favorites = result.favorites;
            localStorage.setItem('bibobavto_user', JSON.stringify(storedUser));

            // Перезагружаем каталог для синхронизации с сервером
            await loadCarsFromBackend();

        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert(error.message || 'Произошла ошибка. Попробуйте позже.');
        }
    }

    function filterCars(filters) {
        currentPage = 1;
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
                    Убедись, что backend запущен на порту 8000.
                </p>
            `;
        }
    }

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

    loadCarsFromBackend();
}