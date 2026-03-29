import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import { dateLocaleFromLng } from '../../i18n/localeUtils';
import {
  Box, Card, Typography, Avatar,
  TextField, IconButton, List,
  ListItem, ListItemAvatar,
  ListItemText, Divider, Badge,
  InputAdornment, CircularProgress,
  Paper,
} from '@mui/material';
import {
  Send, Search, Message,
  DoneAll, Done,
} from '@mui/icons-material';

const ConversationItem = ({ conv, isActive, onClick, dateLocale }) => (
  <ListItem
    button
    onClick={onClick}
    sx={{
      borderRadius: 2,
      mb: 0.5,
      bgcolor: isActive ? 'primary.50' : 'transparent',
      border: '1px solid',
      borderColor: isActive ? 'primary.200' : 'transparent',
      '&:hover': { bgcolor: isActive ? 'primary.50' : 'grey.50' },
    }}
  >
    <ListItemAvatar>
      <Badge badgeContent={conv.unread_count} color="error" overlap="circular">
        <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 700 }}>{conv.user?.name?.charAt(0)}</Avatar>
      </Badge>
    </ListItemAvatar>
    <ListItemText
      primary={
        <Typography fontWeight={conv.unread_count > 0 ? 700 : 500} noWrap>
          {conv.user?.name}
        </Typography>
      }
      secondary={
        <Typography variant="caption" color="text.secondary" noWrap fontWeight={conv.unread_count > 0 ? 600 : 400}>
          {conv.last_message}
        </Typography>
      }
    />
    <Box sx={{ textAlign: 'end', minWidth: 50 }}>
      <Typography variant="caption" color="text.secondary" display="block">
        {conv.last_time
          ? new Date(conv.last_time).toLocaleTimeString(dateLocale, {
              hour: '2-digit',
              minute: '2-digit',
            })
          : ''}
      </Typography>
    </Box>
  </ListItem>
);

const MessageBubble = ({ msg, isMe, dateLocale }) => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: isMe ? 'flex-end' : 'flex-start',
      mb: 1.5,
    }}
  >
    {!isMe && (
      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'secondary.main', fontSize: 13 }}>
        {msg.sender?.name?.charAt(0)}
      </Avatar>
    )}
    <Box sx={{ maxWidth: '70%' }}>
      <Paper
        sx={{
          px: 2,
          py: 1.2,
          bgcolor: isMe ? 'primary.main' : 'white',
          color: isMe ? 'white' : 'text.primary',
          borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="body2">{msg.body}</Typography>
      </Paper>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMe ? 'flex-end' : 'flex-start',
          gap: 0.5,
          mt: 0.3,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {new Date(msg.created_at).toLocaleTimeString(dateLocale, {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Typography>
        {isMe &&
          (msg.read_at ? (
            <DoneAll sx={{ fontSize: 14, color: 'primary.main' }} />
          ) : (
            <Done sx={{ fontSize: 14, color: 'text.disabled' }} />
          ))}
      </Box>
    </Box>
  </Box>
);

const Messages = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const dateLocale = dateLocaleFromLng(i18n.language);
  const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [search, setSearch] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    setLoadingConvs(true);
    try {
      const { data } = await axiosInstance.get('/messages');
      setConversations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    try {
      const { data } = await axiosInstance.get(`/messages/${conv.user.id}`);
      setMessages(data);

      setConversations((prev) =>
        prev.map((c) => (c.user.id === conv.user.id ? { ...c, unread_count: 0 } : c)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      const { data } = await axiosInstance.post('/messages', {
        receiver_id: activeConv.user.id,
        body: newMsg.trim(),
      });
      setMessages((prev) => [...prev, data.data]);
      setNewMsg('');

      setConversations((prev) =>
        prev.map((c) =>
          c.user.id === activeConv.user.id ? { ...c, last_message: newMsg.trim(), last_time: new Date() } : c,
        ),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const filtered = conversations.filter((c) => c.user?.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        {t('messages.title')}
      </Typography>

      <Card sx={{ height: '75vh', display: 'flex', overflow: 'hidden' }}>
        <Box
          sx={{
            width: 320,
            borderInlineEnd: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <TextField
              fullWidth
              size="small"
              placeholder={t('messages.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
            {loadingConvs ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                <CircularProgress size={32} />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', pt: 6, px: 2 }}>
                <Message sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                <Typography color="text.secondary" variant="body2">
                  {t('messages.noConversations')}
                </Typography>
              </Box>
            ) : (
              <List disablePadding>
                {filtered.map((conv) => (
                  <ConversationItem
                    key={conv.user.id}
                    conv={conv}
                    isActive={activeConv?.user?.id === conv.user.id}
                    onClick={() => openConversation(conv)}
                    dateLocale={dateLocale}
                  />
                ))}
              </List>
            )}
          </Box>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {activeConv ? (
            <>
              <Box
                sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  bgcolor: 'grey.50',
                }}
              >
                <Avatar sx={{ bgcolor: 'secondary.main' }}>{activeConv.user?.name?.charAt(0)}</Avatar>
                <Box>
                  <Typography fontWeight={700}>{activeConv.user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activeConv.user?.specialty || t('messages.specialtyFallback')}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {loadingMsgs ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', pt: 6 }}>
                    <Typography color="text.secondary">{t('messages.startChat')}</Typography>
                  </Box>
                ) : (
                  messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} isMe={msg.sender_id === user?.id} dateLocale={dateLocale} />
                  ))
                )}
                <div ref={bottomRef} />
              </Box>

              <Divider />
              <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder={t('messages.messagePlaceholder')}
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                  multiline
                  maxRows={3}
                  dir={textDir}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                />
                <IconButton
                  color="primary"
                  onClick={sendMessage}
                  disabled={sending || !newMsg.trim()}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 44,
                    height: 44,
                    '&:hover': { bgcolor: 'primary.dark' },
                    '&:disabled': { bgcolor: 'grey.300' },
                  }}
                >
                  {sending ? <CircularProgress size={20} color="inherit" /> : <Send />}
                </IconButton>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
              }}
            >
              <Message sx={{ fontSize: 80, color: 'text.disabled' }} />
              <Typography variant="h6" color="text.secondary">
                {t('messages.chooseConversation')}
              </Typography>
              <Typography variant="body2" color="text.disabled">
                {t('messages.hintFromPosts')}
              </Typography>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default Messages;
