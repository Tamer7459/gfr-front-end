import axios from 'axios'

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    (process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:8000/api'
        : 'https://gfr-back-end.onrender.com/api')

// إنشاء instance
const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
    withCredentials: true
})

// إضافة Bearer Token تلقائياً لكل طلب
axiosInstance.interceptors.request.use(
    config => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('gfr_token')

            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        }

        return config
    },
    error => Promise.reject(error)
)

// معالجة انتهاء صلاحية التوكن
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (typeof window === 'undefined') return Promise.reject(error)

        const status = error.response?.status
        const url = error.config?.url || ''
        const isAuthRequest =
            url.includes('/login') || url.includes('/register')

        if (status === 401 && !isAuthRequest) {
            localStorage.removeItem('gfr_token')
            setTimeout(() => {
                window.location.href = '/login'
            }, 500)
        }
        return Promise.reject(error)
    }
)

export default axiosInstance
