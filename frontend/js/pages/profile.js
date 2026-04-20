export async function ProfilePage() {
    const response = await fetch('html/profile.html');
    return await response.text();
}