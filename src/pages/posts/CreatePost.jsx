import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axios';
import {
  Box, Card, CardContent, Typography,
  TextField, Button, Chip, Alert,
  CircularProgress, Divider, IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Add, ArrowBack, Send,
  Article, Tag, Close,
} from '@mui/icons-material';

const CreatePost = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  const [form, setForm] = useState({
    title: '',
    body: '',
    keywords: [],
  });
  const [keyword, setKeyword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const addKeyword = () => {
    const kw = keyword.trim();
    if (!kw) return;
    if (form.keywords.includes(kw)) {
      setKeyword('');
      return;
    }
    if (form.keywords.length >= 8) {
      setError(t('createPost.maxKeywords'));
      return;
    }
    setForm((prev) => ({ ...prev, keywords: [...prev.keywords, kw] }));
    setKeyword('');
    setError('');
  };

  const removeKeyword = (kw) => {
    setForm((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== kw),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.title.trim()) {
      setError(t('createPost.titleRequired'));
      return;
    }
    if (!form.body.trim() || form.body.length < 10) {
      setError(t('createPost.abstractMin', { min: 10 }));
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/posts', form);
      setSuccess(t('createPost.success'));
      setTimeout(() => navigate('/posts'), 1500);
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
    <Box maxWidth={700} mx="auto">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/posts')} aria-label={t('common.cancel')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {t('createPost.pageTitle')}
        </Typography>
      </Box>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {success}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              {t('createPost.titleLabel')}
            </Typography>
            <TextField
              fullWidth
              placeholder={t('createPost.titlePh')}
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              sx={{ mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Article color="action" />
                  </InputAdornment>
                ),
              }}
              dir={textDir}
            />

            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              {t('createPost.abstractLabel')}
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={7}
              placeholder={t('createPost.abstractPh')}
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              sx={{ mb: 1 }}
              dir={textDir}
            />
            <Typography
              variant="caption"
              color={form.body.length < 10 ? 'error' : 'text.secondary'}
              sx={{ mb: 3, display: 'block' }}
            >
              {t('createPost.charCount', { count: form.body.length, min: 10 })}
            </Typography>

            <Divider sx={{ my: 3 }} />

            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              {t('createPost.keywordsTitle')}
            </Typography>
            <Typography variant="caption" color="text.secondary" mb={1.5} display="block">
              {t('createPost.keywordsHint')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                placeholder={t('createPost.keywordPh')}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Tag fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
                dir={textDir}
                sx={{ flex: 1 }}
              />
              <Button variant="outlined" startIcon={<Add />} onClick={addKeyword} disabled={!keyword.trim()}>
                {t('createPost.add')}
              </Button>
            </Box>

            {form.keywords.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 3 }}>
                {form.keywords.map((kw, i) => (
                  <Chip
                    key={i}
                    label={kw}
                    color="primary"
                    variant="outlined"
                    onDelete={() => removeKeyword(kw)}
                    deleteIcon={<Close />}
                  />
                ))}
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" onClick={() => navigate('/posts')} disabled={loading}>
                {t('createPost.cancel')}
              </Button>
              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <Send />}
                disabled={loading}
                sx={{ minWidth: 130 }}
              >
                {loading ? t('createPost.publishing') : t('createPost.submit')}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreatePost;
