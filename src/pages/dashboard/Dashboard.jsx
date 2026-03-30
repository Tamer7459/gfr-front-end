import { useEffect, useState , useCallback } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Divider,
  Skeleton,
  Paper,
  useTheme,
} from '@mui/material';
import { Add, Article, Person, TrendingUp, School, ChevronRight, ChevronLeft } from '@mui/icons-material';

const StatCard = ({ icon, label, value, gradient }) => (
  <Card
    sx={{
      overflow: 'visible',
      position: 'relative',
      transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 32px rgba(15, 23, 42, 0.1)',
      },
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        borderRadius: '16px 16px 0 0',
        background: gradient,
      }}
    />
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, pt: 2.5 }}>
      <Avatar
        sx={{
          width: 56,
          height: 56,
          background: gradient,
          color: 'common.white',
          boxShadow: '0 6px 16px rgba(15, 23, 42, 0.15)',
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const PostCard = ({ post }) => (
  <Paper
    component={RouterLink}
    to="/posts"
    elevation={0}
    sx={{
      p: 2.5,
      display: 'block',
      textDecoration: 'none',
      borderRadius: 3,
      border: '1px solid',
      borderColor: 'divider',
      transition: 'all 0.22s ease',
      bgcolor: 'background.paper',
      '&:hover': {
        borderColor: 'primary.main',
        transform: 'translateY(-3px)',
        boxShadow: (theme) => `0 14px 32px ${theme.palette.primary.main}1f`,
      },
    }}
  >
    <Typography fontWeight={700} color="text.primary" noWrap>
      {post.title}
    </Typography>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        mt: 0.75,
        mb: 1.25,
        overflow: 'hidden',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        lineHeight: 1.6,
      }}
    >
      {post.body}
    </Typography>
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {post.keywords?.slice(0, 3).map((kw, i) => (
        <Chip
          key={i}
          label={kw}
          size="small"
          variant="outlined"
          sx={{ borderRadius: 2, fontWeight: 600, borderColor: 'rgba(12, 110, 103, 0.35)', color: 'primary.dark' }}
        />
      ))}
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1.5 }}>
      <Avatar sx={{ width: 26, height: 26, fontSize: 12, fontWeight: 800, bgcolor: 'secondary.main' }}>
        {post.user?.name?.charAt(0)}
      </Avatar>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {post.user?.name}
      </Typography>
    </Box>
  </Paper>
);

const Dashboard = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ myPosts: 0, total: 0 });
  const [loading, setLoading] = useState(true);



  const fetchData = useCallback(async () => {
  try {
    const { data } = await axiosInstance.get('/posts');
    setPosts(data.data?.slice(0, 4) || []);
    setStats({
      total:   data.total   || 0,
      myPosts: data.data?.filter(p => p.user_id === user?.id).length || 0,
    });
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [user?.id]);

  useEffect(() => {
  fetchData();
}, [fetchData]);

  const gradPrimary = (th) => `linear-gradient(135deg, ${th.palette.primary.light}, ${th.palette.primary.dark})`;
  const gradSecondary = (th) => `linear-gradient(135deg, ${th.palette.secondary.light}, ${th.palette.secondary.dark})`;
  const gradMix = (th) => `linear-gradient(135deg, ${th.palette.primary.main} 0%, ${th.palette.secondary.main} 100%)`;

  const ViewAllIcon = theme.direction === 'rtl' ? ChevronLeft : ChevronRight;

  return (
    <Box>
      <Paper
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3,
          borderRadius: 3,
          overflow: 'hidden',
          position: 'relative',
          color: 'common.white',
          background: (th) =>
            `linear-gradient(125deg, ${th.palette.primary.dark} 0%, ${th.palette.primary.main} 45%, ${th.palette.secondary.dark} 100%)`,
          boxShadow: '0 16px 48px rgba(12, 110, 103, 0.25)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.5,
            background:
              'radial-gradient(circle at 85% 20%, rgba(255,255,255,0.2) 0%, transparent 42%), radial-gradient(circle at 10% 80%, rgba(0,0,0,0.12) 0%, transparent 45%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
              {t('dashboard.welcome', { name: user?.name })}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.92, maxWidth: 520, lineHeight: 1.75 }}>
              {user?.specialty || t('dashboard.specialtyHint')}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/posts/create')}
              sx={{
                mt: 2.5,
                bgcolor: 'common.white',
                color: 'primary.dark',
                fontWeight: 800,
                px: 2.5,
                '&:hover': { bgcolor: 'grey.100' },
                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              }}
            >
              {t('dashboard.publishNew')}
            </Button>
          </Box>
          <School
            sx={{
              fontSize: { xs: 72, sm: 96 },
              opacity: 0.22,
              alignSelf: { xs: 'center', sm: 'auto' },
            }}
          />
        </Box>
      </Paper>

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<Article sx={{ fontSize: 28 }} />}
            label={t('dashboard.statTotal')}
            value={loading ? '…' : stats.total}
            gradient={gradPrimary}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<Person sx={{ fontSize: 28 }} />}
            label={t('dashboard.statMine')}
            value={loading ? '…' : stats.myPosts}
            gradient={gradSecondary}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            icon={<TrendingUp sx={{ fontSize: 28 }} />}
            label={t('dashboard.statActivity')}
            value={t('dashboard.active')}
            gradient={gradMix}
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="h6" fontWeight={800}>
              {t('dashboard.latest')}
            </Typography>
            <Button
              component={RouterLink}
              to="/posts"
              size="small"
              endIcon={<ViewAllIcon />}
              sx={{ fontWeight: 700 }}
            >
              {t('dashboard.viewAll')}
            </Button>
          </Box>

          <Divider sx={{ mb: 2.5 }} />

          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((i) => (
                <Grid item xs={12} sm={6} key={i}>
                  <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : posts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Article sx={{ fontSize: 52, color: 'action.disabled', mb: 1.5 }} />
              <Typography color="text.secondary" fontWeight={600}>
                {t('dashboard.noPosts')}
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate('/posts/create')}
                sx={{ mt: 2.5, fontWeight: 800 }}
              >
                {t('dashboard.publishFirst')}
              </Button>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {posts.map((post) => (
                <Grid item xs={12} sm={6} key={post.id}>
                  <PostCard post={post} />
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;
