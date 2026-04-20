export async function AboutPage() {
    const response = await fetch('html/about.html');
    return await response.text();
}