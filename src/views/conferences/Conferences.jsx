'use client';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axios';
import { dateLocaleFromLng } from '../../i18n/localeUtils';
import {
  Box, Card, CardContent, Typography,
  Button, Chip, Avatar, Grid,
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Alert,
  CircularProgress, LinearProgress,
  Divider,
} from '@mui/material';
import {
  Add, Event, LocationOn,
  People, HowToReg, Cancel,
  AccessTime,
} from '@mui/icons-material';

const ConferenceCard = ({ conf, onRegister, onUnregister }) => {
  const { t, i18n } = useTranslation();
  const dateLocale = dateLocaleFromLng(i18n.language);

  const statusMap = {
    upcoming: { label: t('conferences.status.upcoming'), color: 'primary' },
    ongoing: { label: t('conferences.status.ongoing'), color: 'success' },
    completed: { label: t('conferences.status.completed'), color: 'default' },
  };
  const cfg = statusMap[conf.status] || statusMap.upcoming;

  const progress = Math.round((conf.attendees_count / conf.max_attendees) * 100);
  const isFull = conf.attendees_count >= conf.max_attendees;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' },
      }}
    >
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Chip label={cfg.label} color={cfg.color} size="small" />
          <Typography variant="caption" color="text.secondary">
            {new Date(conf.start_date).toLocaleDateString(dateLocale, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Typography>
        </Box>

        <Typography
          variant="h6"
          fontWeight={700}
          mb={1}
          sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {conf.title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          mb={2}
          sx={{
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {conf.description}
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, mb: 2 }}>
          {conf.location && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOn fontSize="small" color="action" />
              <Typography variant="body2">{conf.location}</Typography>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2">
              {new Date(conf.start_date).toLocaleTimeString(dateLocale, {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' — '}
              {new Date(conf.end_date).toLocaleDateString(dateLocale, {
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 22, height: 22, fontSize: 11, bgcolor: 'secondary.main' }}>
              {conf.organizer?.name?.charAt(0)}
            </Avatar>
            <Typography variant="body2">{conf.organizer?.name}</Typography>
          </Box>
        </Box>

        <Box mb={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              <People fontSize="inherit" /> {t('conferences.attendees')}
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {conf.attendees_count} / {conf.max_attendees}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(progress, 100)}
            color={isFull ? 'error' : progress > 70 ? 'warning' : 'primary'}
            sx={{ borderRadius: 2, height: 6 }}
          />
        </Box>
      </CardContent>

      <Divider />

      <Box sx={{ p: 2 }}>
        {conf.is_registered ? (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={() => onUnregister(conf.id)}
            size="small"
          >
            {t('conferences.unregister')}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={<HowToReg />}
            onClick={() => onRegister(conf.id)}
            disabled={isFull || conf.status === 'completed'}
            size="small"
          >
            {isFull ? t('conferences.full') : t('conferences.register')}
          </Button>
        )}
      </Box>
    </Card>
  );
};

const CreateConferenceDialog = ({ open, onClose, onCreate }) => {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    submission_deadline: '',
    max_attendees: 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleCreate = async () => {
    if (!form.title || !form.description || !form.start_date || !form.end_date) {
      setError(t('conferences.fillRequired'));
      return;
    }
    setLoading(true);
    try {
      await onCreate(form);
      setForm({
        title: '',
        description: '',
        location: '',
        start_date: '',
        end_date: '',
        submission_deadline: '',
        max_attendees: 100,
      });
      onClose();
    } catch (err) {
      setError(
        Object.values(err.response?.data?.errors || {})
          .flat()
          .join(' | ') ||
          err.response?.data?.message ||
          t('common.errorGeneric'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>{t('conferences.createTitle')}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          name="title"
          label={t('conferences.fieldTitle')}
          value={form.title}
          onChange={handleChange}
          sx={{ mt: 1, mb: 2 }}
          dir={textDir}
        />
        <TextField
          fullWidth
          name="description"
          label={t('conferences.fieldDescription')}
          value={form.description}
          onChange={handleChange}
          multiline
          rows={3}
          sx={{ mb: 2 }}
          dir={textDir}
        />
        <TextField
          fullWidth
          name="location"
          label={t('conferences.fieldLocation')}
          value={form.location}
          onChange={handleChange}
          sx={{ mb: 2 }}
          dir={textDir}
        />
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="start_date"
              label={t('conferences.fieldStart')}
              type="datetime-local"
              value={form.start_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="end_date"
              label={t('conferences.fieldEnd')}
              type="datetime-local"
              value={form.end_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="submission_deadline"
              label={t('conferences.fieldDeadline')}
              value={form.submission_deadline}
              onChange={handleChange}
              placeholder={t('conferences.deadlinePh')}
              dir={textDir}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              name="max_attendees"
              label={t('conferences.fieldMax')}
              type="number"
              value={form.max_attendees}
              onChange={handleChange}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          {t('common.cancel')}
        </Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} /> : <Add />}
        >
          {t('conferences.createBtn')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Conferences = () => {
  const { t } = useTranslation();
  const [conferences, setConferences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    fetchConferences();
  }, []);

  const fetchConferences = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get('/conferences');
      setConferences(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (confId) => {
    try {
      const { data } = await axiosInstance.post(`/conferences/${confId}/register`);
      setConferences((prev) =>
        prev.map((c) =>
          c.id === confId
            ? {
                ...c,
                is_registered: true,
                attendees_count: data.attendees_count,
              }
            : c,
        ),
      );
      setMsg({ text: t('conferences.msgRegistered'), severity: 'success' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('common.errorGeneric'), severity: 'error' });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleUnregister = async (confId) => {
    try {
      await axiosInstance.post(`/conferences/${confId}/unregister`);
      setConferences((prev) =>
        prev.map((c) =>
          c.id === confId
            ? {
                ...c,
                is_registered: false,
                attendees_count: Math.max(0, c.attendees_count - 1),
              }
            : c,
        ),
      );
      setMsg({ text: t('conferences.msgUnregistered'), severity: 'success' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('common.errorGeneric'), severity: 'error' });
    }
  };

  const handleCreate = async (form) => {
    const { data } = await axiosInstance.post('/conferences', form);
    setConferences((prev) => [data.conference, ...prev]);
    setMsg({ text: t('conferences.msgCreated'), severity: 'success' });
    setTimeout(() => setMsg(null), 4000);
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t('conferences.pageTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('conferences.available', { count: conferences.length })}
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          {t('conferences.createConference')}
        </Button>
      </Box>

      {msg && (
        <Alert severity={msg.severity} sx={{ mb: 2, borderRadius: 2 }} onClose={() => setMsg(null)}>
          {msg.text}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card sx={{ height: 320 }}>
                <CardContent>
                  <CircularProgress size={24} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : conferences.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Event sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" mb={1}>
              {t('conferences.noConferences')}
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
              {t('conferences.createFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {conferences.map((conf) => (
            <Grid item xs={12} sm={6} md={4} key={conf.id}>
              <ConferenceCard conf={conf} onRegister={handleRegister} onUnregister={handleUnregister} />
            </Grid>
          ))}
        </Grid>
      )}

      <CreateConferenceDialog open={createOpen} onClose={() => setCreateOpen(false)} onCreate={handleCreate} />
    </Box>
  );
};

export default Conferences;
