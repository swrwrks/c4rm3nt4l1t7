export async function html() {
    return (await fetch('html/404.html')).text();
}

export function init() {}