export async function html() {
    return (await fetch('html/about.html')).text();
}

export function init() {}