import { useEffect, useState } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axios';
import { dateLocaleFromLng } from '../../i18n/localeUtils';
import {
  Box, Card, CardContent, Typography,
  Avatar, Chip, Grid, Divider,
  Skeleton, Button, Paper,
} from '@mui/material';
import {
  School, Article, RateReview,
  CalendarMonth, Message,
} from '@mui/icons-material';

const ResearcherProfile = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const dateLocale = dateLocaleFromLng(i18n.language);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [id]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/users/${id}/profile`);
      setProfile(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <Box maxWidth={800} mx="auto">
        <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={300} />
      </Box>
    );

  if (!profile)
    return (
      <Box textAlign="center" py={8}>
        <Typography color="text.secondary">{t('researcher.notFound')}</Typography>
      </Box>
    );

  const stats = [
    { icon: <Article />, label: t('researcher.statPosts'), value: profile.posts_count || 0, color: 'primary' },
    { icon: <School />, label: t('researcher.statPapers'), value: profile.journals_count || 0, color: 'secondary' },
    { icon: <RateReview />, label: t('researcher.statReviews'), value: profile.reviews_count || 0, color: 'success' },
  ];

  return (
    <Box maxWidth={800} mx="auto">
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'flex-start' }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                fontSize: 40,
                fontWeight: 700,
                bgcolor: 'primary.main',
                flexShrink: 0,
              }}
            >
              {profile.name?.charAt(0)?.toUpperCase()}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" fontWeight={700} mb={0.5}>
                {profile.name}
              </Typography>

              {profile.specialty && (
                <Chip
                  icon={<School fontSize="small" />}
                  label={profile.specialty}
                  color="primary"
                  variant="outlined"
                  size="small"
                  sx={{ mb: 1.5 }}
                />
              )}

              {profile.bio && (
                <Typography color="text.secondary" variant="body2" sx={{ mb: 1.5, lineHeight: 1.8 }}>
                  {profile.bio}
                </Typography>
              )}

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarMonth fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {t('researcher.memberSince')}{' '}
                  {new Date(profile.created_at).toLocaleDateString(dateLocale, {
                    year: 'numeric',
                    month: 'long',
                  })}
                </Typography>
              </Box>
            </Box>

            <Button component={RouterLink} to="/messages" variant="outlined" startIcon={<Message />} size="small">
              {t('researcher.message')}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={2} mb={3}>
        {stats.map((stat, i) => (
          <Grid item xs={4} key={i}>
            <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  mb: 1,
                  color: `${stat.color}.main`,
                }}
              >
                {stat.icon}
              </Box>
              <Typography variant="h4" fontWeight={700}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {profile.posts?.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              {t('researcher.latestPosts')}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {profile.posts.map((post, i) => (
              <Box key={post.id}>
                <Box sx={{ py: 1.5 }}>
                  <Typography fontWeight={600} mb={0.5}>
                    {post.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {post.body}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    {post.keywords?.slice(0, 4).map((kw, j) => (
                      <Chip key={j} label={kw} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
                {i < profile.posts.length - 1 && <Divider />}
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ResearcherProfile;
