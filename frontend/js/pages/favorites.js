export async function FavoritesPage() {
    const response = await fetch('html/favorites.html');
    return await response.text();
}

// Глобальная функция для удаления из избранного
window.removeFromFavorites = function(id) {
    let favorites = JSON.parse(localStorage.getItem('bibobavto_favorites') || '[]');
    favorites = favorites.filter(car => car.id !== id);
    localStorage.setItem('bibobavto_favorites', JSON.stringify(favorites));

    // Перезагружаем страницу для обновления
    window.location.reload();
};