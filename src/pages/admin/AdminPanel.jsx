import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axiosInstance from '../../api/axios';
import { dateLocaleFromLng } from '../../i18n/localeUtils';
import {
  Box, Card, CardContent, Typography,
  Tabs, Tab, Avatar, Chip, IconButton,
  Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow,
  Paper, Skeleton, Alert, Tooltip,
  Grid,
} from '@mui/material';
import {
  Delete, AdminPanelSettings,
  Person, Article, Group,
  ManageAccounts,
} from '@mui/icons-material';

const StatCard = ({ icon, label, value, color }) => (
  <Card>
    <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 52, height: 52 }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h4" fontWeight={700}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

const AdminPanel = () => {
  const { t, i18n } = useTranslation();
  const dateLocale = dateLocaleFromLng(i18n.language);

  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, postsRes, statsRes] = await Promise.all([
        axiosInstance.get('/admin/users'),
        axiosInstance.get('/admin/posts'),
        axiosInstance.get('/admin/stats'),
      ]);
      setUsers(usersRes.data.data || []);
      setPosts(postsRes.data.data || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t('admin.confirmDeleteUser'))) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setMsg({ text: t('admin.userDeleted'), severity: 'success' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('common.errorGeneric'), severity: 'error' });
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm(t('admin.confirmDeletePost'))) return;
    try {
      await axiosInstance.delete(`/admin/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setMsg({ text: t('admin.postDeleted'), severity: 'success' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('common.errorGeneric'), severity: 'error' });
    }
  };

  const handleToggleRole = async (userId) => {
    try {
      const { data } = await axiosInstance.patch(`/admin/users/${userId}/role`);
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: data.user.role } : u)));
      setMsg({ text: t('admin.roleChanged'), severity: 'success' });
      setTimeout(() => setMsg(null), 3000);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || t('common.errorGeneric'), severity: 'error' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AdminPanelSettings sx={{ fontSize: 36, color: 'error.main' }} />
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t('admin.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('admin.subtitle')}
          </Typography>
        </Box>
      </Box>

      {msg && (
        <Alert severity={msg.severity} sx={{ mb: 2, borderRadius: 2 }} onClose={() => setMsg(null)}>
          {msg.text}
        </Alert>
      )}

      {loading ? (
        <Grid container spacing={2} mb={3}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Skeleton variant="rounded" height={90} />
            </Grid>
          ))}
        </Grid>
      ) : (
        stats && (
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} sm={4}>
              <StatCard icon={<Group />} label={t('admin.totalUsers')} value={stats.total_users} color="primary" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                icon={<Article />}
                label={t('admin.totalPosts')}
                value={stats.total_posts}
                color="secondary"
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <StatCard
                icon={<AdminPanelSettings />}
                label={t('admin.admins')}
                value={stats.total_admins}
                color="error"
              />
            </Grid>
          </Grid>
        )
      )}

      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)}>
            <Tab
              icon={<Person fontSize="small" />}
              iconPosition="start"
              label={t('admin.tabUsers', { count: users.length })}
            />
            <Tab
              icon={<Article fontSize="small" />}
              iconPosition="start"
              label={t('admin.tabPosts', { count: posts.length })}
            />
          </Tabs>
        </Box>

        <CardContent sx={{ p: 0 }}>
          {tab === 0 && (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>
                      <Typography fontWeight={600}>#</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colUser')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colEmail')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colRole')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colPosts')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colActions')}</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? [1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                          {[1, 2, 3, 4, 5, 6].map((j) => (
                            <TableCell key={j}>
                              <Skeleton variant="text" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : users.map((u, idx) => (
                        <TableRow key={u.id} hover>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>
                                {u.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {u.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {u.specialty || '—'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{u.email}</Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={u.role === 'admin' ? t('admin.roleAdmin') : t('admin.roleUser')}
                              color={u.role === 'admin' ? 'error' : 'default'}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{u.posts_count || 0}</Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                              <Tooltip title={t('admin.toggleRole')}>
                                <IconButton size="small" color="primary" onClick={() => handleToggleRole(u.id)}>
                                  <ManageAccounts fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title={t('admin.deleteUser')}>
                                <IconButton size="small" color="error" onClick={() => handleDeleteUser(u.id)}>
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {tab === 1 && (
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell>
                      <Typography fontWeight={600}>#</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colTitle')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colAuthor')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colComments')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colLikes')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colDate')}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={600}>{t('admin.colDelete')}</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading
                    ? [1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i}>
                          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                            <TableCell key={j}>
                              <Skeleton variant="text" />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    : posts.map((post, idx) => (
                        <TableRow key={post.id} hover>
                          <TableCell>{idx + 1}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600} sx={{ maxWidth: 200 }} noWrap>
                              {post.title}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">{post.user?.name || '—'}</Typography>
                          </TableCell>
                          <TableCell>{post.comments_count || 0}</TableCell>
                          <TableCell>{post.likes_count || 0}</TableCell>
                          <TableCell>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(post.created_at).toLocaleDateString(dateLocale)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title={t('admin.deletePost')}>
                              <IconButton size="small" color="error" onClick={() => handleDeletePost(post.id)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminPanel;
