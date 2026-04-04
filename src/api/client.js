import axios from 'axios'

const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/api'
        : 'https://gfr-back-end.onrender.com/api')

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    }
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('gfr_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
