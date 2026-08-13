'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'

export default function AdminLayout({ children }) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    } else if (!loading && user && !isAdmin) {
      router.replace('/dashboard')
    }
  }, [loading, user, isAdmin, router])

  if (loading) return <LoadingSpinner />
  if (!user || !isAdmin) return null

  return <>{children}</>
}
