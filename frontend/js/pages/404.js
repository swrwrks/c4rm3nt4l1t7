export async function NotFoundPage() {
    const response = await fetch('html/404.html');
    return await response.text();
}