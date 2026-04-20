export async function RequestsPage() {
    const response = await fetch('html/requests.html');
    return await response.text();
}