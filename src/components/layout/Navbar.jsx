import { useState, useMemo } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
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
  Drawer,
  List,
  ListItemButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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
  MenuBook,
  Event,
  Menu as MenuIcon,
  Translate,
} from '@mui/icons-material';

const Navbar = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const downMd = useMediaQuery(theme.breakpoints.down('md'));
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const [langAnchor, setLangAnchor] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const open = Boolean(anchorEl);

  const drawerAnchor = theme.direction === 'rtl' ? 'right' : 'left';

  const handleLogout = async () => {
    setAnchorEl(null);
    setMobileOpen(false);
    await logout();
    navigate('/login');
  };

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || 'U';

  const navLinks = useMemo(
    () => [
      { label: t('nav.home'), icon: <Dashboard fontSize="small" />, path: '/dashboard' },
      { label: t('nav.research'), icon: <Article fontSize="small" />, path: '/posts' },
      { label: t('nav.publishResearch'), icon: <Add fontSize="small" />, path: '/posts/create' },
      { label: t('nav.journals'), icon: <MenuBook fontSize="small" />, path: '/journals' },
      { label: t('nav.conferences'), icon: <Event fontSize="small" />, path: '/conferences' },
    ],
    [t],
  );

  const closeMobile = () => setMobileOpen(false);

  const menuPaperSx = {
    width: 240,
    borderRadius: 2,
    mt: 1,
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 12px 40px rgba(15, 23, 42, 0.12)',
  };

  return (
    <>
      <AppBar position="sticky" elevation={0} color="transparent">
        <Toolbar
          sx={{
            justifyContent: 'space-between',
            gap: 1,
            minHeight: { xs: 60, md: 68 },
            maxWidth: 1280,
            width: '100%',
            mx: 'auto',
            px: { xs: 1.5, md: 3 },
          }}
        >
          <Box
            component={RouterLink}
            to="/dashboard"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              textDecoration: 'none',
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: (th) =>
                  `linear-gradient(135deg, ${th.palette.primary.main} 0%, ${th.palette.primary.dark} 100%)`,
                boxShadow: '0 4px 14px rgba(12, 110, 103, 0.35)',
              }}
            >
              <School sx={{ color: 'common.white', fontSize: 26 }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.1,
                  background: (th) =>
                    `linear-gradient(90deg, ${th.palette.primary.dark}, ${th.palette.primary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                GFR
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1, mt: 0.25 }}>
                {t('nav.tagline')}
              </Typography>
            </Box>
          </Box>

          {!downMd && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                flexWrap: 'wrap',
                justifyContent: 'center',
                flex: 1,
              }}
            >
              {navLinks.map((link) => (
                <Button
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  startIcon={link.icon}
                  sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    px: 1.25,
                    borderRadius: 2,
                    '&:hover': {
                      bgcolor: 'rgba(12, 110, 103, 0.08)',
                    },
                  }}
                >
                  {link.label}
                </Button>
              ))}
              {isAdmin && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  startIcon={<AdminPanelSettings fontSize="small" />}
                  sx={{
                    fontWeight: 700,
                    color: 'secondary.main',
                    borderRadius: 2,
                    '&:hover': { bgcolor: 'rgba(196, 92, 38, 0.1)' },
                  }}
                >
                  {t('nav.admin')}
                </Button>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
            {downMd && (
              <IconButton
                aria-label={t('nav.menu')}
                onClick={() => setMobileOpen(true)}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Tooltip title={t('nav.language')}>
              <IconButton
                size="small"
                onClick={(e) => setLangAnchor(e.currentTarget)}
                sx={{ color: 'text.secondary' }}
              >
                <Translate fontSize="small" />
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={langAnchor}
              open={Boolean(langAnchor)}
              onClose={() => setLangAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: theme.direction === 'rtl' ? 'left' : 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: theme.direction === 'rtl' ? 'left' : 'right' }}
              PaperProps={{ sx: menuPaperSx }}
            >
              <MenuItem
                selected={i18n.language === 'en'}
                onClick={() => {
                  i18n.changeLanguage('en');
                  setLangAnchor(null);
                }}
              >
                English
              </MenuItem>
              <MenuItem
                selected={i18n.language === 'ar'}
                onClick={() => {
                  i18n.changeLanguage('ar');
                  setLangAnchor(null);
                }}
              >
                العربية
              </MenuItem>
              <MenuItem
                selected={i18n.language === 'fr'}
                onClick={() => {
                  i18n.changeLanguage('fr');
                  setLangAnchor(null);
                }}
              >
                Français
              </MenuItem>
            </Menu>

            <Tooltip title={t('nav.messages')}>
              <IconButton component={RouterLink} to="/messages" sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={0} color="error">
                  <Message />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={t('nav.notifications')}>
              <IconButton sx={{ color: 'text.secondary' }}>
                <Badge badgeContent={0} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>

            <Tooltip title={user?.name}>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: 16,
                    fontWeight: 800,
                    background: (th) =>
                      `linear-gradient(145deg, ${th.palette.secondary.main}, ${th.palette.secondary.dark})`,
                    boxShadow: '0 2px 8px rgba(196, 92, 38, 0.3)',
                  }}
                >
                  {avatarLetter}
                </Avatar>
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor={drawerAnchor}
        open={mobileOpen}
        onClose={closeMobile}
        PaperProps={{
          sx: {
            width: 280,
            pt: 2,
            borderRadius: drawerAnchor === 'right' ? '16px 0 0 16px' : '0 16px 16px 0',
          },
        }}
      >
        <List sx={{ px: 1 }}>
          {navLinks.map((link) => (
            <ListItemButton
              key={link.path}
              component={RouterLink}
              to={link.path}
              onClick={closeMobile}
              sx={{ borderRadius: 2, mb: 0.5 }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
            </ListItemButton>
          ))}
          {isAdmin && (
            <ListItemButton
              component={RouterLink}
              to="/admin"
              onClick={closeMobile}
              sx={{ borderRadius: 2, color: 'secondary.main' }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: 'secondary.main' }}>
                <AdminPanelSettings fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={t('nav.admin')} primaryTypographyProps={{ fontWeight: 700 }} />
            </ListItemButton>
          )}
        </List>
      </Drawer>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: theme.direction === 'rtl' ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: theme.direction === 'rtl' ? 'left' : 'right',
        }}
        PaperProps={{ sx: menuPaperSx }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography fontWeight={800} noWrap>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user?.email}
          </Typography>
        </Box>

        <Divider />

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate('/profile');
          }}
        >
          <ListItemIcon>
            <Person fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('nav.profile')}</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            navigate('/messages');
          }}
        >
          <ListItemIcon>
            <Message fontSize="small" />
          </ListItemIcon>
          <ListItemText>{t('nav.messages')}</ListItemText>
        </MenuItem>

        {isAdmin && (
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              navigate('/admin');
            }}
          >
            <ListItemIcon>
              <AdminPanelSettings fontSize="small" color="secondary" />
            </ListItemIcon>
            <ListItemText sx={{ color: 'secondary.main', fontWeight: 700 }}>{t('nav.adminPanel')}</ListItemText>
          </MenuItem>
        )}

        <Divider />

        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>{t('nav.logout')}</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default Navbar;
