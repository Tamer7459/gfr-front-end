import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, IconButton, Menu, MenuItem, Tooltip, useTheme } from '@mui/material';
import { School, Translate } from '@mui/icons-material';

/** Shared layout for sign-in / sign-up with hero panel + form area */
const AuthShell = ({ children, headline, subheadline }) => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [langAnchor, setLangAnchor] = useState(null);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        bgcolor: 'background.default',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 12,
          zIndex: 10,
          ...(theme.direction === 'rtl' ? { left: 12 } : { right: 12 }),
        }}
      >
        <Tooltip title={t('nav.language')}>
          <IconButton
            onClick={(e) => setLangAnchor(e.currentTarget)}
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              '&:hover': { bgcolor: 'background.paper' },
            }}
            aria-label={t('nav.language')}
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
      </Box>

      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          justifyContent: 'center',
          px: 6,
          py: 8,
          position: 'relative',
          background: (th) =>
            `linear-gradient(145deg, ${th.palette.primary.dark} 0%, ${th.palette.primary.main} 42%, ${th.palette.secondary.dark} 100%)`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse 80% 60% at 20% 40%, rgba(255,255,255,0.12) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(0,0,0,0.15) 0%, transparent 50%)',
            pointerEvents: 'none',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            opacity: 0.35,
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            pointerEvents: 'none',
          },
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 420 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(8px)',
              }}
            >
              <School sx={{ fontSize: 28, color: 'common.white' }} />
            </Box>
            <Typography variant="h5" fontWeight={800} sx={{ color: 'common.white', letterSpacing: 0.5 }}>
              GFR
            </Typography>
          </Box>
          <Typography
            variant="h3"
            sx={{
              color: 'common.white',
              fontWeight: 800,
              lineHeight: 1.15,
              mb: 2,
              fontSize: { md: '2.25rem', lg: '2.75rem' },
            }}
          >
            {headline}
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, maxWidth: 380 }}>
            {subheadline}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 2, sm: 3 },
          position: 'relative',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -120,
            right: -80,
            width: 280,
            height: 280,
            borderRadius: '50%',
            background: (th) => `${th.palette.primary.main}`,
            opacity: 0.06,
            filter: 'blur(60px)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: -60,
            left: -40,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: (th) => `${th.palette.secondary.main}`,
            opacity: 0.08,
            filter: 'blur(50px)',
            pointerEvents: 'none',
          }}
        />
        {children}
      </Box>
    </Box>
  );
};

export default AuthShell;
