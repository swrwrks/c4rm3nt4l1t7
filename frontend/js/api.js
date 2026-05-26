
export const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const res = await fetch(`http://localhost:8000${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Ошибка');
        }

        return res.json();
    },

    get: (url) => api.request(url),
    post: (url, body) => api.request(url, { method: 'POST', body: JSON.stringify(body) })
};