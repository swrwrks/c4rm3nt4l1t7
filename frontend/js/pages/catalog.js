export async function CatalogPage() {
    const response = await fetch('html/catalog.html');
    return await response.text();
}