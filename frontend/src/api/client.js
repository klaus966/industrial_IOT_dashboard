import axios from 'axios';

// Create Axios Instance
const client = axios.create({
    baseURL: 'http://localhost:8000', // Proxy handles this
});

// Add Token Interceptor
client.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('[API] Request:', config.url);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] Header set:', config.headers.Authorization.substring(0, 20) + '...');
        } else {
            console.warn('[API] No token found in localStorage');
        }
        return config;
    },
    (error) => Promise.reject(error)
);

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Check if we are not already on login page to avoid loops
            // if (!window.location.pathname.includes('/login')) {
            //     window.location.href = '/login';
            // }
            console.warn("Debug: 401 Error prevented redirect");
        }
        return Promise.reject(error);
    }
);

export default client;
