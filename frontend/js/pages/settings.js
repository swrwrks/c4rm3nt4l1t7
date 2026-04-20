export async function SettingsPage() {
    const response = await fetch('html/settings.html');
    return await response.text();
}