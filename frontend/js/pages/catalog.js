export async function html() {
    return (await fetch('html/catalog.html')).text();
}

export function init() {}