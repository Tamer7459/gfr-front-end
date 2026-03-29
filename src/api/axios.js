import axios from 'axios'

// إنشاء instance
const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
    },
    withCredentials: false
})

// إضافة Bearer Token تلقائياً لكل طلب
axiosInstance.interceptors.request.use(
    config => {
        const token = localStorage.getItem('gfr_token')

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    error => Promise.reject(error)
)

// معالجة انتهاء صلاحية التوكن
axiosInstance.interceptors.response.use(
    response => response,
    error => {
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
