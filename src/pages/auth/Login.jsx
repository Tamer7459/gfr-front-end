import { useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import AuthShell from '../../components/layout/AuthShell'
import {
    Box,
    Card,
    CardContent,
    TextField,
    Button,
    Typography,
    Link,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress
} from '@mui/material'
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    School
} from '@mui/icons-material'

const Login = () => {
    const { t, i18n } = useTranslation()
    const { login } = useAuth()
    const navigate = useNavigate()
    const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr'

    const [form, setForm] = useState({ email: '', password: '' })
    const [showPass, setShowPass] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
        setError('')
    }

    const handleSubmit = async e => {
        e.preventDefault()
        if (!form.email || !form.password) {
            setError(t('auth.fillAll'))
            return
        }
        setLoading(true)
        try {
            await login(form.email, form.password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.message || t('auth.invalidCreds'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthShell
            headline={t('auth.loginHeadline')}
            subheadline={t('auth.loginSub')}
        >
            <Card
                sx={{
                    width: '100%',
                    maxWidth: 420,
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Box
                        sx={{
                            display: { xs: 'flex', md: 'none' },
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 1,
                            mb: 3
                        }}
                    >
                        <School sx={{ fontSize: 40, color: 'primary.main' }} />
                        <Typography
                            variant="h5"
                            fontWeight={800}
                            color="primary"
                        >
                            GFR
                        </Typography>
                    </Box>

                    <Typography
                        variant="h5"
                        fontWeight={800}
                        mb={0.5}
                        textAlign="center"
                    >
                        {t('auth.loginTitle')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        sx={{ mb: 3 }}
                    >
                        {t('auth.loginWelcome')}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            name="email"
                            label={t('auth.email')}
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            sx={{ mb: 2 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Email color="action" />
                                    </InputAdornment>
                                )
                            }}
                            dir={textDir}
                        />

                        <TextField
                            fullWidth
                            name="password"
                            label={t('auth.password')}
                            type={showPass ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            sx={{ mb: 3 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Lock color="action" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPass(p => !p)}
                                            edge="end"
                                            aria-label={t('auth.showPassword')}
                                        >
                                            {showPass ? (
                                                <VisibilityOff />
                                            ) : (
                                                <Visibility />
                                            )}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                            dir={textDir}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{
                                py: 1.5,
                                mb: 2,
                                background: th =>
                                    `linear-gradient(90deg, ${th.palette.primary.main}, ${th.palette.primary.dark})`,
                                boxShadow: '0 8px 24px rgba(12, 110, 103, 0.35)'
                            }}
                        >
                            {loading ? (
                                <CircularProgress size={24} color="inherit" />
                            ) : (
                                t('auth.loginBtn')
                            )}
                        </Button>

                        <Typography textAlign="center" variant="body2">
                            {t('auth.noAccount')}{' '}
                            <Link
                                component={RouterLink}
                                to="/register"
                                fontWeight={700}
                                underline="hover"
                            >
                                {t('auth.createAccount')}
                            </Link>
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        </AuthShell>
    )
}

export default Login
