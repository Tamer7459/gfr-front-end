'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useThemeContext } from '../../context/ThemeContext'
import axiosInstance from '../../api/axios'
import { setPendingTargetUser } from '../../utils/navigationState'
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Tooltip,
    Badge,
    Button,
    ListItemIcon,
    ListItemText,
    Switch
} from '@mui/material'
import {
    School,
    Dashboard,
    Article,
    Add,
    AdminPanelSettings,
    Logout,
    Person,
    Message,
    Notifications,
    DarkMode,
    LightMode,
    MenuBook,
    Event,
    Translate
} from '@mui/icons-material'

const Navbar = () => {
    const { user, logout, isAdmin } = useAuth()
    const { t, i18n } = useTranslation()
    const { mode, toggleTheme } = useThemeContext()
    const router = useRouter()

    const [anchorEl, setAnchorEl] = useState(null)
    const [langAnchor, setLangAnchor] = useState(null)
    const [notificationAnchor, setNotificationAnchor] = useState(null)
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const open = Boolean(anchorEl)
    const notificationOpen = Boolean(notificationAnchor)

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const { data } = await axiosInstance.get('/messages')
                const unreadNotifications = (data || [])
                    .filter(conv => (conv.unread_count || 0) > 0)
                    .sort(
                        (left, right) =>
                            new Date(right.last_time || 0) -
                            new Date(left.last_time || 0)
                    )

                setNotifications(unreadNotifications)
                setUnreadCount(
                    unreadNotifications.reduce(
                        (sum, conv) => sum + (conv.unread_count || 0),
                        0
                    )
                )
            } catch {
                setUnreadCount(0)
                setNotifications([])
            }
        }

        fetchNotifications()
        const intervalId = setInterval(fetchNotifications, 10000)

        return () => clearInterval(intervalId)
    }, [])

    const openConversationFromNotification = conv => {
        setNotificationAnchor(null)
        setPendingTargetUser(conv.user)
        router.push('/messages')
    }

    const handleLogout = async () => {
        setAnchorEl(null)
        await logout()
        router.replace('/login')
    }

    const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'U'

    const navLinks = [
        {
            label: t('nav.home'),
            icon: <Dashboard fontSize="small" />,
            path: '/dashboard'
        },
        {
            label: t('nav.research'),
            icon: <Article fontSize="small" />,
            path: '/posts'
        },
        {
            label: t('nav.journals'),
            icon: <MenuBook fontSize="small" />,
            path: '/journals'
        },
        {
            label: t('nav.conferences'),
            icon: <Event fontSize="small" />,
            path: '/conferences'
        },
        {
            label: t('nav.publishResearch'),
            icon: <Add fontSize="small" />,
            path: '/posts/create'
        }
    ]

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                {/* Logo */}
                <Box
                    component={Link}
                    href="/dashboard"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        textDecoration: 'none'
                    }}
                >
                    <School sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        color="primary.main"
                    >
                        GFR
                    </Typography>
                </Box>

                {/* Nav Links */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {navLinks.map(link => (
                        <Button
                            key={link.path}
                            component={Link}
                            href={link.path}
                            startIcon={link.icon}
                            sx={{
                                color: 'text.primary',
                                fontWeight: 500,
                                fontSize: '0.85rem',
                                '&:hover': { bgcolor: 'action.hover' }
                            }}
                        >
                            {link.label}
                        </Button>
                    ))}
                    {isAdmin && (
                        <Button
                            component={Link}
                            href="/admin"
                            startIcon={<AdminPanelSettings fontSize="small" />}
                            color="error"
                            sx={{ fontWeight: 500 }}
                        >
                            {t('nav.admin')}
                        </Button>
                    )}
                </Box>

                {/* Right Side */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {/* Dark Mode Toggle */}
                    <Tooltip
                        title={
                            mode === 'dark'
                                ? t('nav.lightMode')
                                : t('nav.darkMode')
                        }
                    >
                        <IconButton
                            onClick={toggleTheme}
                            sx={{ color: 'text.secondary' }}
                        >
                            {mode === 'dark' ? (
                                <LightMode sx={{ color: '#ffd700' }} />
                            ) : (
                                <DarkMode />
                            )}
                        </IconButton>
                    </Tooltip>

                    {/* Language */}
                    <Tooltip title={t('nav.language')}>
                        <IconButton
                            onClick={e => setLangAnchor(e.currentTarget)}
                            sx={{ color: 'text.secondary' }}
                            aria-label={t('nav.language')}
                        >
                            <Translate />
                        </IconButton>
                    </Tooltip>

                    {/* Messages */}
                    <Tooltip title={t('nav.messages')}>
                        <IconButton
                            component={Link}
                            href="/messages"
                            sx={{ color: 'text.secondary' }}
                        >
                            <Badge badgeContent={unreadCount} color="error">
                                <Message />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip title={t('nav.notifications')}>
                        <IconButton
                            onClick={e =>
                                setNotificationAnchor(e.currentTarget)
                            }
                            sx={{ color: 'text.secondary' }}
                            aria-label={t('nav.notifications')}
                        >
                            <Badge badgeContent={unreadCount} color="error">
                                <Notifications />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* Avatar */}
                    <Tooltip title={user?.name}>
                        <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
                            <Avatar
                                sx={{
                                    width: 38,
                                    height: 38,
                                    bgcolor: 'primary.main',
                                    fontSize: 16,
                                    fontWeight: 700
                                }}
                            >
                                {avatarLetter}
                            </Avatar>
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Dropdown Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={() => setAnchorEl(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{ sx: { width: 240, borderRadius: 2, mt: 1 } }}
                >
                    {/* User Info */}
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography fontWeight={700} noWrap>
                            {user?.name}
                        </Typography>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                        >
                            {user?.email}
                        </Typography>
                    </Box>

                    <Divider />

                    <MenuItem
                        onClick={() => {
                            setAnchorEl(null)
                            router.push('/profile')
                        }}
                    >
                        <ListItemIcon>
                            <Person fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('nav.profile')}</ListItemText>
                    </MenuItem>

                    <MenuItem
                        onClick={() => {
                            setAnchorEl(null)
                            router.push('/messages')
                        }}
                    >
                        <ListItemIcon>
                            <Message fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('nav.messages')}</ListItemText>
                    </MenuItem>

                    {/* Dark Mode في القائمة */}
                    <MenuItem onClick={toggleTheme}>
                        <ListItemIcon>
                            {mode === 'dark' ? (
                                <LightMode
                                    fontSize="small"
                                    sx={{ color: '#ffd700' }}
                                />
                            ) : (
                                <DarkMode fontSize="small" />
                            )}
                        </ListItemIcon>
                        <ListItemText>
                            {mode === 'dark'
                                ? t('nav.lightMode')
                                : t('nav.darkMode')}
                        </ListItemText>
                        <Switch
                            checked={mode === 'dark'}
                            size="small"
                            onChange={toggleTheme}
                            onClick={e => e.stopPropagation()}
                        />
                    </MenuItem>

                    {isAdmin &&
                        [
                            <Divider key="divider" />,
                            <MenuItem
                                key="admin"
                                onClick={() => {
                                    setAnchorEl(null)
                                    router.push('/admin')
                                }}
                            >
                                <ListItemIcon>
                                    <AdminPanelSettings
                                        fontSize="small"
                                        color="error"
                                    />
                                </ListItemIcon>
                                <ListItemText sx={{ color: 'error.main' }}>
                                    {t('nav.adminPanel')}
                                </ListItemText>
                            </MenuItem>,
                        ]}

                    <Divider />

                    <MenuItem
                        onClick={handleLogout}
                        sx={{ color: 'error.main' }}
                    >
                        <ListItemIcon>
                            <Logout fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText>{t('nav.logout')}</ListItemText>
                    </MenuItem>
                </Menu>

                <Menu
                    anchorEl={langAnchor}
                    open={Boolean(langAnchor)}
                    onClose={() => setLangAnchor(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                    <MenuItem
                        selected={i18n.language === 'en'}
                        onClick={() => {
                            i18n.changeLanguage('en')
                            setLangAnchor(null)
                        }}
                    >
                        🇬🇧 English
                    </MenuItem>
                    <MenuItem
                        selected={i18n.language === 'ar'}
                        onClick={() => {
                            i18n.changeLanguage('ar')
                            setLangAnchor(null)
                        }}
                    >
                        🇩🇿 العربية
                    </MenuItem>
                    <MenuItem
                        selected={i18n.language === 'fr'}
                        onClick={() => {
                            i18n.changeLanguage('fr')
                            setLangAnchor(null)
                        }}
                    >
                        🇫🇷 Français
                    </MenuItem>
                </Menu>

                <Menu
                    anchorEl={notificationAnchor}
                    open={notificationOpen}
                    onClose={() => setNotificationAnchor(null)}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    PaperProps={{ sx: { width: 340, borderRadius: 2, mt: 1 } }}
                >
                    <Box sx={{ px: 2, py: 1.5 }}>
                        <Typography fontWeight={700} noWrap>
                            {t('nav.notifications')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {unreadCount > 0
                                ? t('nav.unreadNotifications', {
                                      count: unreadCount
                                  })
                                : t('nav.noNotifications')}
                        </Typography>
                    </Box>

                    <Divider />

                    {notifications.length === 0 ? (
                        <MenuItem disabled>{t('nav.noNotifications')}</MenuItem>
                    ) : (
                        notifications.map(conv => (
                            <MenuItem
                                key={conv.user?.id}
                                onClick={() =>
                                    openConversationFromNotification(conv)
                                }
                                sx={{ py: 1.2 }}
                            >
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5,
                                        width: '100%'
                                    }}
                                >
                                    <Badge
                                        badgeContent={conv.unread_count}
                                        color="error"
                                        overlap="circular"
                                    >
                                        <Avatar
                                            sx={{ bgcolor: 'secondary.main' }}
                                        >
                                            {conv.user?.name?.charAt(0) || 'U'}
                                        </Avatar>
                                    </Badge>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography fontWeight={700} noWrap>
                                            {conv.user?.name}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            noWrap
                                        >
                                            {conv.last_message ||
                                                t('nav.newNotification')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                        ))
                    )}

                    <Divider />

                    <MenuItem
                        onClick={() => {
                            setNotificationAnchor(null)
                            router.push('/messages')
                        }}
                    >
                        <ListItemText>{t('nav.viewAllMessages')}</ListItemText>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    )
}

export default Navbar
