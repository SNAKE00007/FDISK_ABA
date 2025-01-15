import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});

api.interceptors.request.use(config => {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (auth?.token) {
        config.headers.Authorization = auth.token;
        config.headers['Department-Id'] = auth.user.department_id;
    }
    return config;
});

export default api;