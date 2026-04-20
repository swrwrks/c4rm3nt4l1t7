export async function HomePage() {
    const response = await fetch('html/home.html');
    return await response.text();
}