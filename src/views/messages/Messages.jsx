'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/AuthContext'
import axiosInstance from '../../api/axios'
import EmojiPicker from 'emoji-picker-react'
import { useTheme } from '@mui/material/styles'
import { consumePendingTargetUser } from '../../utils/navigationState'
import {
    Box,
    Card,
    Typography,
    Avatar,
    TextField,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Badge,
    InputAdornment,
    CircularProgress,
    Paper,
    Popover
} from '@mui/material'
import {
    Send,
    Search,
    Message,
    DoneAll,
    Done,
    EmojiEmotions
} from '@mui/icons-material'

// ── فقاعة رسالة ───────────────────────────────
const MessageBubble = ({ msg, isMe, reaction, onReact }) => (
    <Box
        sx={{
            display: 'flex',
            justifyContent: isMe ? 'flex-end' : 'flex-start',
            mb: 1.5,
            alignItems: 'flex-end',
            gap: 1
        }}
    >
        {!isMe && (
            <Avatar
                sx={{
                    width: 30,
                    height: 30,
                    fontSize: 13,
                    bgcolor: 'secondary.main'
                }}
            >
                {msg.sender?.name?.charAt(0)}
            </Avatar>
        )}
        <Box sx={{ maxWidth: '70%' }}>
            <Paper
                sx={{
                    px: 2,
                    py: 1.2,
                    bgcolor: isMe ? 'primary.main' : 'background.paper',
                    color: isMe ? 'white' : 'text.primary',
                    borderRadius: isMe
                        ? '18px 18px 4px 18px'
                        : '18px 18px 18px 4px',
                    border: isMe ? 'none' : '1px solid',
                    borderColor: 'divider'
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
                    mt: 0.3
                }}
            >
                <Typography variant="caption" color="text.disabled">
                    {new Date(msg.created_at).toLocaleTimeString('ar-EG', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Typography>
                {isMe &&
                    (msg.read_at ? (
                        <DoneAll sx={{ fontSize: 14, color: 'primary.main' }} />
                    ) : (
                        <Done sx={{ fontSize: 14, color: 'text.disabled' }} />
                    ))}
                <IconButton
                    size="small"
                    onClick={onReact}
                    sx={{
                        width: 22,
                        height: 22,
                        color: 'text.disabled'
                    }}
                >
                    <EmojiEmotions sx={{ fontSize: 14 }} />
                </IconButton>
            </Box>
            {reaction && (
                <Typography
                    variant="caption"
                    sx={{ mt: 0.2, display: 'block' }}
                >
                    {reaction}
                </Typography>
            )}
        </Box>
    </Box>
)

// ── بطاقة محادثة ──────────────────────────────
const ConversationItem = ({ conv, isActive, onClick, onAvatarClick }) => (
    <ListItem
        button
        onClick={onClick}
        sx={{
            borderRadius: 2,
            mb: 0.5,
            bgcolor: isActive ? 'primary.main' : 'transparent',
            color: isActive ? 'white' : 'text.primary',
            '&:hover': { bgcolor: isActive ? 'primary.dark' : 'action.hover' }
        }}
    >
        <ListItemAvatar>
            <Badge
                badgeContent={conv.unread_count}
                color="error"
                overlap="circular"
            >
                <Avatar
                    onClick={e => {
                        e.stopPropagation()
                        onAvatarClick?.()
                    }}
                    sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }}
                >
                    {conv.user?.name?.charAt(0)}
                </Avatar>
            </Badge>
        </ListItemAvatar>
        <ListItemText
            primary={
                <Typography
                    fontWeight={conv.unread_count > 0 ? 700 : 500}
                    color={isActive ? 'white' : 'text.primary'}
                    noWrap
                >
                    {conv.user?.name}
                </Typography>
            }
            secondary={
                <Typography
                    variant="caption"
                    color={
                        isActive ? 'rgba(255,255,255,0.8)' : 'text.secondary'
                    }
                    noWrap
                >
                    {conv.last_message}
                </Typography>
            }
        />
    </ListItem>
)

// ── الصفحة الرئيسية ───────────────────────────
const Messages = () => {
    const { user } = useAuth()
    const router = useRouter()
    const muiTheme = useTheme()

    const [conversations, setConversations] = useState([])
    const [activeConv, setActiveConv] = useState(null)
    const [messages, setMessages] = useState([])
    const [newMsg, setNewMsg] = useState('')
    const [search, setSearch] = useState('')
    const [loadingConvs, setLoadingConvs] = useState(true)
    const [loadingMsgs, setLoadingMsgs] = useState(false)
    const [sending, setSending] = useState(false)
    const [emojiAnchorEl, setEmojiAnchorEl] = useState(null)
    const [reactionAnchorEl, setReactionAnchorEl] = useState(null)
    const [reactionMessageId, setReactionMessageId] = useState(null)
    const [messageReactions, setMessageReactions] = useState({})

    const bottomRef = useRef(null)
    const targetHandledRef = useRef(false)

    // ── تحميل المحادثات ──────────────────────────
    const fetchConversations = useCallback(
        async (silent = false) => {
            if (!silent) setLoadingConvs(true)
            try {
                const { data } = await axiosInstance.get('/messages')
                setConversations(data)

                // إذا جاء المستخدم من صفحة باحث
                const targetUser = consumePendingTargetUser()
                if (targetUser && !targetHandledRef.current) {
                    targetHandledRef.current = true
                    const existing = data.find(
                        c => c.user?.id === targetUser.id
                    )
                    if (existing) {
                        openConversation(existing)
                    } else {
                        // محادثة جديدة
                        const newConv = {
                            user: targetUser,
                            last_message: '',
                            last_time: null,
                            unread_count: 0
                        }
                        setConversations(prev => [newConv, ...prev])
                        setActiveConv(newConv)
                        setMessages([])
                    }
                }
            } catch (err) {
                console.error(err)
            } finally {
                if (!silent) setLoadingConvs(false)
            }
        },
        [consumePendingTargetUser]
    )

    useEffect(() => {
        fetchConversations()
    }, [fetchConversations])

    // ── تحديث تلقائي عند وصول رسائل جديدة ─────
    useEffect(() => {
        const intervalId = setInterval(async () => {
            await fetchConversations(true)

            if (!activeConv?.user?.id) return

            try {
                const { data } = await axiosInstance.get(
                    `/messages/${activeConv.user.id}`
                )

                setMessages(prev => {
                    const prevLast = prev[prev.length - 1]?.id
                    const nextLast = data[data.length - 1]?.id
                    if (prev.length === data.length && prevLast === nextLast) {
                        return prev
                    }
                    return data
                })

                setConversations(prev => {
                    const current = prev.find(
                        c => c.user?.id === activeConv.user.id
                    )
                    if (!current) return prev

                    const updated = { ...current, unread_count: 0 }
                    const rest = prev.filter(
                        c => c.user?.id !== activeConv.user.id
                    )
                    return [updated, ...rest]
                })
            } catch (err) {
                console.error(err)
            }
        }, 5000)

        return () => clearInterval(intervalId)
    }, [activeConv?.user?.id, fetchConversations])

    // ── التمرير للأسفل ───────────────────────────
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // ── فتح محادثة ───────────────────────────────
    const openConversation = async conv => {
        setActiveConv(conv)
        setLoadingMsgs(true)
        try {
            const { data } = await axiosInstance.get(
                `/messages/${conv.user.id}`
            )
            setMessages(data)
            setConversations(prev =>
                prev.map(c =>
                    c.user?.id === conv.user?.id ? { ...c, unread_count: 0 } : c
                )
            )
        } catch (err) {
            console.error(err)
            setMessages([])
        } finally {
            setLoadingMsgs(false)
        }
    }

    // ── إرسال رسالة ──────────────────────────────
    const sendMessage = async () => {
        if (!newMsg.trim() || !activeConv) return
        const body = newMsg.trim()
        setSending(true)
        setNewMsg('')
        try {
            const { data } = await axiosInstance.post('/messages', {
                receiver_id: activeConv.user.id,
                body
            })
            setMessages(prev => [...prev, data.data])

            setConversations(prev => {
                const updatedConv = {
                    user: activeConv.user,
                    last_message: body,
                    last_time: data.data?.created_at || new Date(),
                    unread_count: 0
                }

                const withoutCurrent = prev.filter(
                    c => c.user?.id !== activeConv.user.id
                )
                return [updatedConv, ...withoutCurrent]
            })
        } catch (err) {
            console.error(err)
        } finally {
            setSending(false)
        }
    }

    const filtered = conversations.filter(c =>
        c.user?.name?.toLowerCase().includes(search.toLowerCase())
    )

    useEffect(() => {
        if (!user?.id) return
        const storageKey = `message_reactions_${user.id}`
        try {
            const saved = localStorage.getItem(storageKey)
            setMessageReactions(saved ? JSON.parse(saved) : {})
        } catch {
            setMessageReactions({})
        }
    }, [user?.id])

    useEffect(() => {
        if (!user?.id) return
        const storageKey = `message_reactions_${user.id}`
        localStorage.setItem(storageKey, JSON.stringify(messageReactions))
    }, [messageReactions, user?.id])

    const goToUserProfile = userId => {
        if (!userId) return
        if (userId === user?.id) {
            router.push('/profile')
            return
        }
        router.push(`/researchers/${userId}`)
    }

    const addEmojiToInput = emojiData => {
        setNewMsg(prev => `${prev}${emojiData.emoji}`)
        setEmojiAnchorEl(null)
    }

    const openReactionMenu = (event, messageId) => {
        setReactionAnchorEl(event.currentTarget)
        setReactionMessageId(messageId)
    }

    const selectReaction = emojiData => {
        if (!reactionMessageId) return
        setMessageReactions(prev => ({
            ...prev,
            [reactionMessageId]: emojiData.emoji
        }))
        setReactionAnchorEl(null)
        setReactionMessageId(null)
    }

    return (
        <Box>
            <Typography variant="h5" fontWeight={700} mb={3}>
                الرسائل الخاصة
            </Typography>

            <Card sx={{ height: '75vh', display: 'flex', overflow: 'hidden' }}>
                {/* القائمة */}
                <Box
                    sx={{
                        width: 300,
                        borderLeft: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper'
                    }}
                >
                    {/* بطاقة المستخدم الحالي */}
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            '&:hover': { bgcolor: 'action.hover' }
                        }}
                    >
                        <Avatar
                            onClick={() => goToUserProfile(user?.id)}
                            sx={{
                                bgcolor: 'primary.main',
                                width: 50,
                                height: 50,
                                cursor: 'pointer'
                            }}
                        >
                            {user?.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography fontWeight={700} fontSize={14}>
                                {user?.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                حسابك الشخصي
                            </Typography>
                        </Box>
                    </Box>

                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="بحث..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search fontSize="small" />
                                    </InputAdornment>
                                )
                            }}
                        />
                    </Box>

                    <Box sx={{ flex: 1, overflow: 'auto', p: 1 }}>
                        {loadingConvs ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    pt: 4
                                }}
                            >
                                <CircularProgress size={28} />
                            </Box>
                        ) : filtered.length === 0 ? (
                            <Box sx={{ textAlign: 'center', pt: 6 }}>
                                <Message
                                    sx={{
                                        fontSize: 48,
                                        color: 'text.disabled',
                                        mb: 1
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    لا توجد محادثات
                                </Typography>
                            </Box>
                        ) : (
                            <List disablePadding>
                                {filtered.map(conv => (
                                    <ConversationItem
                                        key={conv.user?.id}
                                        conv={conv}
                                        isActive={
                                            activeConv?.user?.id ===
                                            conv.user?.id
                                        }
                                        onClick={() => openConversation(conv)}
                                        onAvatarClick={() =>
                                            goToUserProfile(conv.user?.id)
                                        }
                                    />
                                ))}
                            </List>
                        )}
                    </Box>
                </Box>

                {/* منطقة المحادثة */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.default'
                    }}
                >
                    {activeConv ? (
                        <>
                            {/* Header */}
                            <Box
                                sx={{
                                    p: 2,
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    bgcolor: 'background.paper',
                                    '&:hover': { bgcolor: 'action.hover' }
                                }}
                            >
                                <Avatar
                                    onClick={() =>
                                        goToUserProfile(activeConv.user?.id)
                                    }
                                    sx={{
                                        bgcolor: 'secondary.main',
                                        cursor: 'pointer'
                                    }}
                                >
                                    {activeConv.user?.name?.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography fontWeight={700}>
                                        {activeConv.user?.name}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {activeConv.user?.specialty || 'باحث'}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* الرسائل */}
                            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                                {loadingMsgs ? (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            pt: 4
                                        }}
                                    >
                                        <CircularProgress size={28} />
                                    </Box>
                                ) : messages.length === 0 ? (
                                    <Box sx={{ textAlign: 'center', pt: 6 }}>
                                        <Typography color="text.secondary">
                                            ابدأ المحادثة الآن 👋
                                        </Typography>
                                    </Box>
                                ) : (
                                    messages.map(msg => (
                                        <MessageBubble
                                            key={msg.id}
                                            msg={msg}
                                            isMe={msg.sender_id === user?.id}
                                            reaction={messageReactions[msg.id]}
                                            onReact={event =>
                                                openReactionMenu(event, msg.id)
                                            }
                                        />
                                    ))
                                )}
                                <div ref={bottomRef} />
                            </Box>

                            {/* حقل الإرسال */}
                            <Divider />
                            <Box
                                sx={{
                                    p: 2,
                                    display: 'flex',
                                    gap: 1,
                                    bgcolor: 'background.paper'
                                }}
                            >
                                <IconButton
                                    onClick={e =>
                                        setEmojiAnchorEl(e.currentTarget)
                                    }
                                    sx={{
                                        bgcolor: 'action.hover',
                                        width: 44,
                                        height: 44,
                                        '&:hover': {
                                            bgcolor: 'action.selected'
                                        }
                                    }}
                                >
                                    <EmojiEmotions />
                                </IconButton>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="اكتب رسالة..."
                                    value={newMsg}
                                    onChange={e => setNewMsg(e.target.value)}
                                    onKeyDown={e => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault()
                                            sendMessage()
                                        }
                                    }}
                                    multiline
                                    maxRows={3}
                                    dir="rtl"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 3
                                        }
                                    }}
                                />
                                <IconButton
                                    onClick={sendMessage}
                                    disabled={sending || !newMsg.trim()}
                                    sx={{
                                        bgcolor: 'primary.main',
                                        color: 'white',
                                        width: 44,
                                        height: 44,
                                        '&:hover': { bgcolor: 'primary.dark' },
                                        '&:disabled': {
                                            bgcolor: 'action.disabledBackground'
                                        }
                                    }}
                                >
                                    {sending ? (
                                        <CircularProgress
                                            size={18}
                                            color="inherit"
                                        />
                                    ) : (
                                        <Send />
                                    )}
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
                                gap: 2
                            }}
                        >
                            <Message
                                sx={{ fontSize: 80, color: 'text.disabled' }}
                            />
                            <Typography variant="h6" color="text.secondary">
                                اختر محادثة للبدء
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Card>

            <Popover
                anchorEl={emojiAnchorEl}
                open={Boolean(emojiAnchorEl)}
                onClose={() => setEmojiAnchorEl(null)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                PaperProps={{ sx: { overflow: 'hidden' } }}
            >
                <EmojiPicker
                    onEmojiClick={addEmojiToInput}
                    lazyLoadEmojis
                    searchDisabled={false}
                    skinTonesDisabled
                    width={320}
                    height={420}
                    theme={muiTheme.palette.mode === 'dark' ? 'dark' : 'light'}
                />
            </Popover>

            <Popover
                anchorEl={reactionAnchorEl}
                open={Boolean(reactionAnchorEl)}
                onClose={() => {
                    setReactionAnchorEl(null)
                    setReactionMessageId(null)
                }}
                anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                PaperProps={{ sx: { overflow: 'hidden' } }}
            >
                <EmojiPicker
                    onEmojiClick={selectReaction}
                    lazyLoadEmojis
                    searchDisabled={false}
                    skinTonesDisabled
                    width={320}
                    height={420}
                    theme={muiTheme.palette.mode === 'dark' ? 'dark' : 'light'}
                />
            </Popover>
        </Box>
    )
}

export default Messages
