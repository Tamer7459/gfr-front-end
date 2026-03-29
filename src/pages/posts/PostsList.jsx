import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Chat } from '@mui/icons-material';
import axiosInstance from '../../api/axios';
import { dateLocaleFromLng } from '../../i18n/localeUtils';
import {
  Box, Card, CardContent, CardActions,
  Typography, Button, Avatar, Chip,
  IconButton, TextField, InputAdornment,
  Divider, Skeleton, Collapse,
  List, ListItem, ListItemAvatar,
  ListItemText, Pagination, Tooltip,
} from '@mui/material';
import {
  Favorite, FavoriteBorder, Comment,
  Add, Search, Delete, Send,
} from '@mui/icons-material';

const PostCard = ({ post, currentUser, onLike, onDelete, onComment, navigate, t, textDir, dateLocale }) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOwner = currentUser?.id === post.user_id;

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(post.id, commentText);
    setCommentText('');
    setSubmitting(false);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 44, height: 44 }}>
              {post.user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography fontWeight={600}>{post.user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {post.user?.specialty || t('posts.researcher')} ·{' '}
                {new Date(post.created_at).toLocaleDateString(dateLocale)}
              </Typography>
            </Box>
          </Box>
          {isOwner && (
            <IconButton size="small" color="error" onClick={() => onDelete(post.id)}>
              <Delete fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography variant="h6" fontWeight={700} mb={1}>
          {post.title}
        </Typography>
        <Typography
          color="text.secondary"
          sx={{
            mb: 1.5,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {post.body}
        </Typography>

        {post.keywords?.length > 0 && (
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
            {post.keywords.map((kw, i) => (
              <Chip key={i} label={kw} size="small" variant="outlined" color="primary" />
            ))}
          </Box>
        )}
      </CardContent>

      <Divider />

      <CardActions sx={{ px: 2 }}>
        <IconButton size="small" onClick={() => onLike(post.id)} color={post.is_liked ? 'error' : 'default'}>
          {post.is_liked ? <Favorite /> : <FavoriteBorder />}
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
          {post.likes_count}
        </Typography>

        <IconButton size="small" onClick={() => setShowComments((p) => !p)} sx={{ ml: 1 }}>
          <Comment fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {post.comments_count}
        </Typography>
        {currentUser?.id !== post.user_id && (
          <Tooltip title={t('posts.messageUser', { name: post.user?.name })}>
            <IconButton size="small" sx={{ ml: 'auto' }} onClick={() => navigate('/messages')}>
              <Chat fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>

      <Collapse in={showComments}>
        <Divider />
        <Box sx={{ px: 2, pb: 2 }}>
          {post.comments?.length > 0 && (
            <List dense sx={{ mb: 1 }}>
              {post.comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13, bgcolor: 'secondary.main' }}>
                      {comment.user?.name?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={600}>
                        {comment.user?.name}
                      </Typography>
                    }
                    secondary={comment.body}
                  />
                </ListItem>
              ))}
            </List>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('posts.commentPlaceholder')}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              dir={textDir}
            />
            <IconButton color="primary" onClick={handleComment} disabled={submitting || !commentText.trim()}>
              <Send />
            </IconButton>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
};

const PostsList = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  const dateLocale = dateLocaleFromLng(i18n.language);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/posts?page=${page}`);
      setPosts(data.data || []);
      setTotal(data.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await axiosInstance.post(`/posts/${postId}/like`);
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, is_liked: data.liked, likes_count: data.likes_count } : p)),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm(t('posts.deleteConfirm'))) return;
    try {
      await axiosInstance.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId, body) => {
    try {
      const { data } = await axiosInstance.post(`/posts/${postId}/comments`, { body });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? {
                ...p,
                comments: [...(p.comments || []), data.comment],
                comments_count: (p.comments_count || 0) + 1,
              }
            : p,
        ),
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.body.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          {t('posts.title')}
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/posts/create')}>
          {t('posts.publish')}
        </Button>
      </Box>

      <TextField
        fullWidth
        placeholder={t('posts.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        dir={textDir}
      />

      {loading ? (
        [1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={200} sx={{ mb: 2 }} />)
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary" mb={2}>
              {t('posts.noResults')}
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/posts/create')}>
              {t('posts.publishFirst')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        filtered.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            onLike={handleLike}
            onDelete={handleDelete}
            onComment={handleComment}
            navigate={navigate}
            t={t}
            textDir={textDir}
            dateLocale={dateLocale}
          />
        ))
      )}

      {total > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={total} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Box>
  );
};

export default PostsList;
