'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Box } from '@mui/material'
import Navbar from '@/components/layout/Navbar'
import LoadingSpinner from '@/components/common/LoadingSpinner'
import { useAuth } from '@/context/AuthContext'

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login')
    }
  }, [loading, user, router])

  if (loading) return <LoadingSpinner />
  if (!user) return null

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        backgroundImage: (theme) =>
          `radial-gradient(ellipse 120% 80% at 50% -20%, ${theme.palette.primary.main}14, transparent 50%), radial-gradient(ellipse 80% 60% at 100% 100%, ${theme.palette.secondary.main}12, transparent 45%)`,
      }}
    >
      <Navbar />
      <Box
        component="main"
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          px: { xs: 2, sm: 3, md: 4 },
          py: { xs: 2.5, md: 4 },
          pb: 6,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}
