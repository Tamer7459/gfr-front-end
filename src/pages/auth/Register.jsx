import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import AuthShell from '../../components/layout/AuthShell';
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
  CircularProgress,
} from '@mui/material';
import { Person, Email, Lock, Visibility, VisibilityOff, School } from '@mui/icons-material';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Register = () => {
  const { t, i18n } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  const [form, setForm] = useState({
  name:                  '',
  email:                 '',
  password:              '',
  password_confirmation: '',
  role:                  'researcher',  // ← جديد
});

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      setError(t('auth.fillAll'));
      return;
    }
    if (form.password.length < 8) {
      setError(t('auth.passwordShort'));
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.password_confirmation, form.role);
      navigate('/dashboard');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        setError(Object.values(errors).flat().join(' | '));
      } else {
        setError(err.response?.data?.message || t('auth.errorGeneric'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell headline={t('auth.registerHeadline')} subheadline={t('auth.registerSub')}>
      <Card
        sx={{
          width: '100%',
          maxWidth: 440,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Box
            sx={{
              display: { xs: 'flex', md: 'none' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              mb: 2,
            }}
          >
            <School sx={{ fontSize: 40, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight={800} color="primary">
              GFR
            </Typography>
          </Box>

          <Typography variant="h5" fontWeight={800} mb={0.5} textAlign="center">
            {t('auth.registerTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
            {t('auth.registerLead')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              name="name"
              label={t('auth.fullName')}
              value={form.name}
              onChange={handleChange}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="action" />
                  </InputAdornment>
                ),
              }}
              dir={textDir}
            />

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
                ),
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
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass((p) => !p)} edge="end" aria-label={t('auth.showPassword')}>
                      {showPass ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              dir={textDir}
            />

            <TextField
              fullWidth
              name="password_confirmation"
              label={t('auth.confirmPassword')}
              type={showPass ? 'text' : 'password'}
              value={form.password_confirmation}
              onChange={handleChange}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
              dir={textDir}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
  <InputLabel>{t('auth.role')}</InputLabel>
  <Select
    name="role"
    value={form.role}
    onChange={handleChange}
    label={t('auth.role')}
  >
    <MenuItem value="researcher">🔬 {t('Researcher')}</MenuItem>
    <MenuItem value="professor">🎓 {t('Professor')}</MenuItem>
    <MenuItem value="reviewer">📝 {t('Reviewer')}</MenuItem>
  </Select>
</FormControl>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                mb: 2,
                background: (th) => `linear-gradient(90deg, ${th.palette.primary.main}, ${th.palette.primary.dark})`,
                boxShadow: '0 8px 24px rgba(12, 110, 103, 0.35)',
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : t('auth.registerBtn')}
            </Button>

            <Typography textAlign="center" variant="body2">
              {t('auth.haveAccount')}{' '}
              <Link component={RouterLink} to="/login" fontWeight={700} underline="hover">
                {t('auth.signIn')}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </AuthShell>
  );
};

export default Register;
