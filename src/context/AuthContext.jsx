'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import axiosInstance from '../api/axios'
import i18n from '../i18n'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    // ── تحميل المستخدم عند فتح التطبيق ──────────
    useEffect(() => {
        if (typeof window === 'undefined') {
            setLoading(false)
            return
        }
        const token = localStorage.getItem('gfr_token')
        if (token) {
            fetchUser()
        } else {
            setLoading(false)
        }
    }, [])

    const fetchUser = async () => {
        try {
            const { data } = await axiosInstance.get('/me')
            setUser(data)
        } catch {
            if (typeof window !== 'undefined') localStorage.removeItem('gfr_token')
        } finally {
            setLoading(false)
        }
    }

    // ── تسجيل الدخول ─────────────────────────────
    const login = async (email, password) => {
        try {
            const { data } = await axiosInstance.post('/login', {
                email,
                password
            })
            if (!data.token) {
                throw new Error(i18n.t('auth.noToken'))
            }
            if (typeof window !== 'undefined') localStorage.setItem('gfr_token', data.token)
            setUser(data.user)
            return data
        } catch (error) {
            // تنظيف في حالة الخطأ
            if (typeof window !== 'undefined') localStorage.removeItem('gfr_token')
            throw error
        }
    }

    // ── تسجيل حساب جديد ──────────────────────────
    const register = async (name, email, password, password_confirmation, role = 'researcher') => {
        try {
            const { data } = await axiosInstance.post('/register', {
                name,
                email,
                password,
                password_confirmation,
                role,
            })
            if (!data.token) {
                throw new Error(i18n.t('auth.noToken'))
            }
            if (typeof window !== 'undefined') localStorage.setItem('gfr_token', data.token)
            setUser(data.user)
            return data
        } catch (error) {
            throw error
        }
    }

    // ── تسجيل الخروج ─────────────────────────────
    const logout = async () => {
        try {
            await axiosInstance.post('/logout')
        } finally {
            if (typeof window !== 'undefined') localStorage.removeItem('gfr_token')
            setUser(null)
        }
    }

    // ── تحديث بيانات المستخدم ─────────────────────
    const updateUser = newData => {
        setUser(prev => ({ ...prev, ...newData }))
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                updateUser,
                isAdmin: user?.role === 'admin'
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}
