import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import axiosInstance from '../../api/axios'
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Tabs,
    Tab,
    Chip,
    Avatar,
    TextField,
    Alert,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material'
import {
    Add,
    ExpandMore,
    ExpandLess,
    RateReview,
    CheckCircle,
    Cancel,
    HourglassEmpty
} from '@mui/icons-material'

const JournalCard = ({ journal, currentUser, onAssign, onReview }) => {
    const { t } = useTranslation()
    const [expanded, setExpanded] = useState(false)

    const statusMap = {
        pending: {
            label: t('journals.status.pending'),
            color: 'default',
            icon: <HourglassEmpty fontSize="small" />
        },
        under_review: {
            label: t('journals.status.under_review'),
            color: 'warning',
            icon: <RateReview fontSize="small" />
        },
        accepted: {
            label: t('journals.status.accepted'),
            color: 'success',
            icon: <CheckCircle fontSize="small" />
        },
        rejected: {
            label: t('journals.status.rejected'),
            color: 'error',
            icon: <Cancel fontSize="small" />
        }
    }
    const cfg = statusMap[journal.status] || statusMap.pending

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        mb: 1.5
                    }}
                >
                    <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                    >
                        <Avatar
                            sx={{
                                bgcolor: 'primary.main',
                                width: 40,
                                height: 40
                            }}
                        >
                            {journal.author?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography fontWeight={600}>
                                {journal.author?.name}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {journal.author?.specialty ||
                                    t('journals.researcher')}
                            </Typography>
                        </Box>
                    </Box>
                    <Chip
                        icon={cfg.icon}
                        label={cfg.label}
                        color={cfg.color}
                        size="small"
                    />
                </Box>

                <Typography variant="h6" fontWeight={700} mb={1}>
                    {journal.title}
                </Typography>

                <Typography
                    color="text.secondary"
                    variant="body2"
                    sx={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: expanded ? 'unset' : 3,
                        WebkitBoxOrient: 'vertical'
                    }}
                >
                    {journal.abstract}
                </Typography>

                <Button
                    size="small"
                    endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
                    onClick={() => setExpanded(p => !p)}
                    sx={{ mt: 0.5, p: 0 }}
                >
                    {expanded ? t('journals.readLess') : t('journals.readMore')}
                </Button>

                {journal.reviews?.length > 0 && (
                    <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                        <Chip
                            label={t('journals.reviewers', {
                                count: journal.reviews.length
                            })}
                            size="small"
                            variant="outlined"
                            icon={<RateReview fontSize="small" />}
                        />
                    </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {currentUser?.role === 'admin' &&
                        journal.status === 'pending' && (
                            <Button
                                size="small"
                                variant="outlined"
                                onClick={() => onAssign(journal)}
                            >
                                {t('journals.assignReviewers')}
                            </Button>
                        )}

                    {journal.reviews?.some(
                        r =>
                            r.reviewer_id === currentUser?.id &&
                            r.decision === 'pending'
                    ) && (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<RateReview />}
                            onClick={() => onReview(journal)}
                        >
                            {t('journals.submitReview')}
                        </Button>
                    )}
                </Box>
            </CardContent>
        </Card>
    )
}

const SubmitDialog = ({ open, onClose, onSubmit }) => {
    const { t, i18n } = useTranslation()
    const [form, setForm] = useState({ title: '', abstract: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr'

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.abstract.trim()) {
            setError(t('journals.allFieldsRequired'))
            return
        }
        if (form.abstract.length < 50) {
            setError(t('journals.abstractTooShort'))
            return
        }
        setLoading(true)
        try {
            await onSubmit(form)
            setForm({ title: '', abstract: '' })
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || t('common.errorGeneric'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight={700}>
                {t('journals.submitNewPaper')}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <TextField
                    fullWidth
                    label={t('journals.paperTitle')}
                    value={form.title}
                    onChange={e =>
                        setForm(p => ({ ...p, title: e.target.value }))
                    }
                    sx={{ mt: 1, mb: 2 }}
                    dir={textDir}
                />
                <TextField
                    fullWidth
                    label={t('journals.abstract')}
                    value={form.abstract}
                    onChange={e =>
                        setForm(p => ({ ...p, abstract: e.target.value }))
                    }
                    multiline
                    rows={5}
                    dir={textDir}
                    helperText={t('journals.charMinAbstract', {
                        count: form.abstract.length
                    })}
                />
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    {t('journals.cancel')}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress size={20} />
                    ) : (
                        t('journals.submitPaper')
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const AssignDialog = ({ open, journal, onClose, onAssign }) => {
    const { t } = useTranslation()
    const [users, setUsers] = useState([])
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchUsers = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get('/admin/users')
            const assignedReviewerIds = new Set(
                (journal?.reviews || []).map(review => review.reviewer_id)
            )

            setUsers(
                data.data?.filter(
                    u =>
                        u.role === 'reviewer' &&
                        u.id !== journal?.user_id &&
                        !assignedReviewerIds.has(u.id)
                ) || []
            )
        } catch (err) {
            console.error(err)
        }
    }, [journal?.user_id, journal?.reviews])

    useEffect(() => {
        if (open) fetchUsers()
    }, [open, fetchUsers])

    const handleAssign = async () => {
        if (selected.length === 0) return
        setLoading(true)
        try {
            await onAssign(journal.id, selected)
            setSelected([])
            onClose()
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle fontWeight={700}>
                {t('journals.assignTitle')}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" mb={2}>
                    {t('journals.assignHint')}
                </Typography>
                <FormControl fullWidth>
                    <InputLabel>{t('journals.reviewersLabel')}</InputLabel>
                    <Select
                        multiple
                        value={selected}
                        onChange={e => setSelected(e.target.value)}
                        label={t('journals.reviewersLabel')}
                        renderValue={sel =>
                            sel
                                .map(id => users.find(u => u.id === id)?.name)
                                .join(', ')
                        }
                    >
                        {users.map(u => (
                            <MenuItem
                                key={u.id}
                                value={u.id}
                                disabled={
                                    selected.length >= 2 &&
                                    !selected.includes(u.id)
                                }
                            >
                                {u.name} —{' '}
                                {u.specialty || t('journals.researcher')}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    {t('journals.cancel')}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleAssign}
                    disabled={loading || selected.length === 0}
                >
                    {loading ? (
                        <CircularProgress size={20} />
                    ) : (
                        t('journals.assignBtn')
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const ReviewDialog = ({ open, journal, onClose, onSubmit }) => {
    const { t, i18n } = useTranslation()
    const [form, setForm] = useState({ feedback: '', decision: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const textDir = i18n.language === 'ar' ? 'rtl' : 'ltr'

    const handleSubmit = async () => {
        if (!form.feedback.trim() || !form.decision) {
            setError(t('journals.allFieldsRequired'))
            return
        }
        setLoading(true)
        try {
            await onSubmit(journal.id, form)
            setForm({ feedback: '', decision: '' })
            onClose()
        } catch (err) {
            setError(err.response?.data?.message || t('common.errorGeneric'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle fontWeight={700}>
                {t('journals.reviewTitle')}
            </DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Typography variant="body2" color="text.secondary" mb={2}>
                    <strong>{journal?.title}</strong>
                </Typography>
                <TextField
                    fullWidth
                    multiline
                    rows={5}
                    label={t('journals.reviewNotes')}
                    value={form.feedback}
                    onChange={e =>
                        setForm(p => ({ ...p, feedback: e.target.value }))
                    }
                    sx={{ mb: 2 }}
                    dir={textDir}
                    helperText={t('journals.reviewNotesHelper')}
                />
                <FormControl fullWidth>
                    <InputLabel>{t('journals.decision')}</InputLabel>
                    <Select
                        value={form.decision}
                        onChange={e =>
                            setForm(p => ({ ...p, decision: e.target.value }))
                        }
                        label={t('journals.decision')}
                    >
                        <MenuItem value="accept">
                            {t('journals.decisionAccept')}
                        </MenuItem>
                        <MenuItem value="revision">
                            {t('journals.decisionRevision')}
                        </MenuItem>
                        <MenuItem value="reject">
                            {t('journals.decisionReject')}
                        </MenuItem>
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    {t('journals.cancel')}
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <CircularProgress size={20} />
                    ) : (
                        t('journals.sendReview')
                    )}
                </Button>
            </DialogActions>
        </Dialog>
    )
}

const Journals = () => {
    const { t } = useTranslation()
    const { user } = useAuth()
    const [tab, setTab] = useState(0)
    const [journals, setJournals] = useState([])
    const [loading, setLoading] = useState(true)
    const [msg, setMsg] = useState(null)
    const [submitOpen, setSubmitOpen] = useState(false)
    const [assignTarget, setAssignTarget] = useState(null)
    const [reviewTarget, setReviewTarget] = useState(null)

    useEffect(() => {
        fetchJournals()
    }, [])

    const fetchJournals = async () => {
        setLoading(true)
        try {
            const { data } = await axiosInstance.get('/journals')
            setJournals(data.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async form => {
        const { data } = await axiosInstance.post('/journals', form)
        setJournals(prev => [data.journal, ...prev])
        setMsg({ text: t('journals.msgSubmitSuccess'), severity: 'success' })
        setTimeout(() => setMsg(null), 4000)
    }

    const handleAssign = async (journalId, reviewerIds) => {
        const { data } = await axiosInstance.post(
            `/journals/${journalId}/assign-reviewers`,
            {
                reviewer_ids: reviewerIds
            }
        )
        setJournals(prev =>
            prev.map(j => (j.id === journalId ? data.journal : j))
        )
        setMsg({ text: t('journals.msgAssignSuccess'), severity: 'success' })
        setTimeout(() => setMsg(null), 3000)
    }

    const handleReview = async (journalId, form) => {
        await axiosInstance.post(`/journals/${journalId}/review`, form)
        fetchJournals()
        setMsg({ text: t('journals.msgReviewSuccess'), severity: 'success' })
        setTimeout(() => setMsg(null), 3000)
    }

    const myJournals = journals.filter(j => j.user_id === user?.id)
    const toReview = journals.filter(j =>
        j.reviews?.some(r => r.reviewer_id === user?.id)
    )

    const tabData = [
        {
            label: t('journals.tabAll', { count: journals.length }),
            data: journals
        },
        {
            label: t('journals.tabMine', { count: myJournals.length }),
            data: myJournals
        },
        {
            label: t('journals.tabReview', { count: toReview.length }),
            data: toReview
        }
    ]

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3
                }}
            >
                <Typography variant="h5" fontWeight={700}>
                    {t('journals.pageTitle')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => setSubmitOpen(true)}
                >
                    {t('journals.submitPaperBtn')}
                </Button>
            </Box>

            {msg && (
                <Alert
                    severity={msg.severity}
                    sx={{ mb: 2 }}
                    onClose={() => setMsg(null)}
                >
                    {msg.text}
                </Alert>
            )}

            <Card sx={{ mb: 3 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
                >
                    {tabData.map((td, i) => (
                        <Tab key={i} label={td.label} />
                    ))}
                </Tabs>
            </Card>

            {loading ? (
                [1, 2, 3].map(i => (
                    <Card key={i} sx={{ mb: 2, p: 2 }}>
                        <CircularProgress size={24} />
                    </Card>
                ))
            ) : tabData[tab].data.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">
                            {t('journals.emptyTab')}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                tabData[tab].data.map(journal => (
                    <JournalCard
                        key={journal.id}
                        journal={journal}
                        currentUser={user}
                        onAssign={j => setAssignTarget(j)}
                        onReview={j => setReviewTarget(j)}
                    />
                ))
            )}

            <SubmitDialog
                open={submitOpen}
                onClose={() => setSubmitOpen(false)}
                onSubmit={handleSubmit}
            />
            <AssignDialog
                open={Boolean(assignTarget)}
                journal={assignTarget}
                onClose={() => setAssignTarget(null)}
                onAssign={handleAssign}
            />
            <ReviewDialog
                open={Boolean(reviewTarget)}
                journal={reviewTarget}
                onClose={() => setReviewTarget(null)}
                onSubmit={handleReview}
            />
        </Box>
    )
}

export default Journals
