import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import axiosInstance from '../../api/axios'
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Avatar,
    Alert,
    Divider,
    CircularProgress,
    Chip
} from '@mui/material'
import {
    Edit,
    Save,
    Cancel,
    Person,
    School,
    Article
} from '@mui/icons-material'

const Profile = () => {
    const { t, i18n } = useTranslation()
    const { user, updateUser } = useAuth()
    const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr'
    const roleKey = user?.role || 'user'
    const roleLabel = t(`profile.roles.${roleKey}`, roleKey)

    const [editing, setEditing] = useState(false)
    const [loading, setLoading] = useState(false)
    const [msg, setMsg] = useState({ text: '', type: 'success' })
    const [form, setForm] = useState({
        name: user?.name || '',
        specialty: user?.specialty || '',
        bio: user?.bio || ''
    })

    const handleChange = e => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSave = async () => {
        if (!form.name.trim()) {
            setMsg({ text: t('profile.nameRequired'), type: 'error' })
            return
        }
        setLoading(true)
        try {
            const { data } = await axiosInstance.put('/profile', form)
            updateUser(data.user)
            setMsg({ text: t('profile.updateSuccess'), type: 'success' })
            setEditing(false)
        } catch (err) {
            setMsg({
                text: err.response?.data?.message || t('common.errorGeneric'),
                type: 'error'
            })
        } finally {
            setLoading(false)
            setTimeout(() => setMsg({ text: '', type: 'success' }), 3000)
        }
    }

    const handleCancel = () => {
        setForm({
            name: user?.name || '',
            specialty: user?.specialty || '',
            bio: user?.bio || ''
        })
        setEditing(false)
        setMsg({ text: '', type: 'success' })
    }

    return (
        <Box maxWidth={650} mx="auto">
            <Typography variant="h5" fontWeight={700} mb={3}>
                {t('profile.title')}
            </Typography>

            {msg.text && (
                <Alert severity={msg.type} sx={{ mb: 2, borderRadius: 2 }}>
                    {msg.text}
                </Alert>
            )}

            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Avatar
                        sx={{
                            width: 90,
                            height: 90,
                            fontSize: 36,
                            fontWeight: 700,
                            bgcolor: 'primary.main',
                            mx: 'auto',
                            mb: 2
                        }}
                    >
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Typography variant="h5" fontWeight={700}>
                        {user?.name}
                    </Typography>
                    <Typography color="text.secondary" mb={1}>
                        {user?.email}
                    </Typography>
                    {user?.specialty && (
                        <Chip
                            icon={<School fontSize="small" />}
                            label={user.specialty}
                            color="primary"
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                        />
                    )}
                    <Chip
                        label={roleLabel}
                        color={
                            roleKey === 'admin'
                                ? 'error'
                                : roleKey === 'professor'
                                  ? 'primary'
                                  : roleKey === 'reviewer'
                                    ? 'secondary'
                                    : 'default'
                        }
                        size="small"
                        sx={{ mt: 1, ml: 1 }}
                    />
                </CardContent>
            </Card>

            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            mb: 3
                        }}
                    >
                        <Typography variant="h6" fontWeight={700}>
                            {t('profile.editData')}
                        </Typography>
                        {!editing && (
                            <Button
                                startIcon={<Edit />}
                                variant="outlined"
                                onClick={() => setEditing(true)}
                            >
                                {t('profile.edit')}
                            </Button>
                        )}
                    </Box>

                    <Divider sx={{ mb: 3 }} />

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            <Person
                                fontSize="small"
                                sx={{ mr: 0.5, verticalAlign: 'middle' }}
                            />
                            {t('profile.fullName')}
                        </Typography>
                        {editing ? (
                            <TextField
                                fullWidth
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                size="small"
                                dir={textDir}
                            />
                        ) : (
                            <Typography color="text.secondary">
                                {user?.name || '—'}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            <School
                                fontSize="small"
                                sx={{ mr: 0.5, verticalAlign: 'middle' }}
                            />
                            {t('profile.specialty')}
                        </Typography>
                        {editing ? (
                            <TextField
                                fullWidth
                                name="specialty"
                                value={form.specialty}
                                onChange={handleChange}
                                placeholder={t('profile.specialtyPh')}
                                size="small"
                                dir={textDir}
                            />
                        ) : (
                            <Typography color="text.secondary">
                                {user?.specialty ||
                                    t('profile.notSetSpecialty')}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={600} mb={1}>
                            <Article
                                fontSize="small"
                                sx={{ mr: 0.5, verticalAlign: 'middle' }}
                            />
                            {t('profile.bio')}
                        </Typography>
                        {editing ? (
                            <TextField
                                fullWidth
                                name="bio"
                                value={form.bio}
                                onChange={handleChange}
                                placeholder={t('profile.bioPh')}
                                multiline
                                rows={4}
                                size="small"
                                dir={textDir}
                            />
                        ) : (
                            <Typography
                                color="text.secondary"
                                sx={{ whiteSpace: 'pre-wrap' }}
                            >
                                {user?.bio || t('profile.noBio')}
                            </Typography>
                        )}
                    </Box>

                    {editing && (
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                justifyContent: 'flex-end'
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={<Cancel />}
                                onClick={handleCancel}
                                disabled={loading}
                            >
                                {t('profile.cancel')}
                            </Button>
                            <Button
                                variant="contained"
                                startIcon={
                                    loading ? (
                                        <CircularProgress
                                            size={18}
                                            color="inherit"
                                        />
                                    ) : (
                                        <Save />
                                    )
                                }
                                onClick={handleSave}
                                disabled={loading}
                            >
                                {loading
                                    ? t('profile.saving')
                                    : t('profile.save')}
                            </Button>
                        </Box>
                    )}
                </CardContent>
            </Card>
        </Box>
    )
}

export default Profile
