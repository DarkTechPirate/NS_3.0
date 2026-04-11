const normalizeUrl = (url) => (url || '').replace(/\/+$/, '');

export const getBackendBaseUrl = () => {
    if (import.meta.env.VITE_SOCKET_URL) {
        return normalizeUrl(import.meta.env.VITE_SOCKET_URL);
    }

    const apiUrl = normalizeUrl(import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
    return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
};
