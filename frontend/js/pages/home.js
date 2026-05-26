export async function html() {
    return (await fetch('html/home.html')).text();
}

export function init() {}