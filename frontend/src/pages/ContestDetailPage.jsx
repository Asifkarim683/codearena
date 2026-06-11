import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { contestService } from '../services/contestService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    ArrowLeft, Calendar, Clock, Users,
    Trophy, Lock, Loader2, CheckCircle2,
    Code2, Zap, Award
} from 'lucide-react'

export default function ContestDetailPage() {
    const { id } = useParams()
    const { isLoggedIn } = useAuth()
    const [contest, setContest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState(false)
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        fetchContest()
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [id])

    const fetchContest = async () => {
        setLoading(true)
        try {
            const res = await contestService.getContestById(id)
            setContest(res.data)
        } catch (error) {
            toast.error('Failed to load contest')
        } finally {
            setLoading(false)
        }
    }

    const handleJoin = async () => {
        setJoining(true)
        try {
            const res = await contestService.joinContest(id)
            setContest(res.data)
            toast.success('Joined contest successfully!')
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to join contest')
        } finally {
            setJoining(false)
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'ONGOING':
                return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Live Now' }
            case 'UPCOMING':
                return { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', label: 'Upcoming' }
            case 'ENDED':
                return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: 'Ended' }
            default:
                return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', label: status }
        }
    }

    const getCountdownParts = (targetDate) => {
        const target = new Date(targetDate)
        const diff = target - now
        if (diff <= 0) return null

        return {
            days: Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((diff / (1000 * 60)) % 60),
            seconds: Math.floor((diff / 1000) % 60),
        }
    }

    const getDiffStyle = (diff) => {
        switch (diff) {
            case 'EASY': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
            case 'MEDIUM': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
            case 'HARD': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
            default: return {}
        }
    }

    const formatDateTime = (d) =>
        new Date(d).toLocaleString('en-IN', {
            weekday: 'short', year: 'numeric', month: 'short',
            day: 'numeric', hour: '2-digit', minute: '2-digit'
        })

    if (loading) return (
        <div style={styles.loadingContainer}>
            <Loader2 size={40} color="#3b82f6"
                style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    )

    if (!contest) return (
        <div style={styles.loadingContainer}>
            <p style={{ color: '#6b7280' }}>Contest not found</p>
        </div>
    )

    const statusStyle = getStatusStyle(contest.status)
    const countdown = contest.status === 'UPCOMING'
        ? getCountdownParts(contest.startTime)
        : contest.status === 'ONGOING'
            ? getCountdownParts(contest.endTime)
            : null

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* Back */}
                <Link to="/contests" style={styles.backBtn}>
                    <ArrowLeft size={16} />
                    Back to Contests
                </Link>

                {/* Hero */}
                <div style={styles.hero}>
                    <div style={styles.heroTop}>
                        <span style={{
                            ...styles.statusBadge,
                            color: statusStyle.color,
                            background: statusStyle.bg,
                        }}>
                            {contest.status === 'ONGOING' && (
                                <span style={styles.liveDot} />
                            )}
                            {statusStyle.label}
                        </span>
                        {isLoggedIn && contest.status !== 'ENDED' && (
                            <button
                                onClick={handleJoin}
                                disabled={joining}
                                style={{
                                    ...styles.joinBtn,
                                    opacity: joining ? 0.7 : 1
                                }}>
                                <CheckCircle2 size={16} />
                                {joining ? 'Joining...' : 'Join Contest'}
                            </button>
                        )}
                    </div>

                    <h1 style={styles.title}>{contest.title}</h1>
                    <p style={styles.description}>
                        {contest.description}
                    </p>

                    {/* Countdown Timer */}
                    {countdown && (
                        <div style={styles.countdownBox}>
                            <p style={styles.countdownLabel}>
                                {contest.status === 'UPCOMING'
                                    ? 'Contest starts in'
                                    : 'Contest ends in'}
                            </p>
                            <div style={styles.countdownTimer}>
                                {[
                                    { value: countdown.days, label: 'Days' },
                                    { value: countdown.hours, label: 'Hours' },
                                    { value: countdown.minutes, label: 'Min' },
                                    { value: countdown.seconds, label: 'Sec' },
                                ].map((item, i) => (
                                    <div key={i} style={styles.timeUnit}>
                                        <div style={styles.timeValue}>
                                            {String(item.value).padStart(2, '0')}
                                        </div>
                                        <div style={styles.timeLabel}>
                                            {item.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div style={styles.metaGrid}>
                        <div style={styles.metaItem}>
                            <Calendar size={16} color="#3b82f6" />
                            <div>
                                <div style={styles.metaLabel}>Start Time</div>
                                <div style={styles.metaValue}>
                                    {formatDateTime(contest.startTime)}
                                </div>
                            </div>
                        </div>
                        <div style={styles.metaItem}>
                            <Clock size={16} color="#f59e0b" />
                            <div>
                                <div style={styles.metaLabel}>End Time</div>
                                <div style={styles.metaValue}>
                                    {formatDateTime(contest.endTime)}
                                </div>
                            </div>
                        </div>
                        <div style={styles.metaItem}>
                            <Users size={16} color="#10b981" />
                            <div>
                                <div style={styles.metaLabel}>Participants</div>
                                <div style={styles.metaValue}>
                                    {contest.totalParticipants} registered
                                </div>
                            </div>
                        </div>
                        <div style={styles.metaItem}>
                            <Code2 size={16} color="#818cf8" />
                            <div>
                                <div style={styles.metaLabel}>Problems</div>
                                <div style={styles.metaValue}>
                                    {contest.totalProblems} total
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Problems Section */}
                <div style={styles.problemsSection}>
                    <h2 style={styles.sectionTitle}>
                        <Trophy size={18} />
                        Contest Problems
                    </h2>

                    {contest.status === 'UPCOMING' ? (
                        <div style={styles.lockedCard}>
                            <Lock size={40} color="#374151" />
                            <p style={styles.lockedTitle}>
                                Problems are locked
                            </p>
                            <p style={styles.lockedSubtext}>
                                Problems will be revealed once the contest starts.
                                Come back at the scheduled time!
                            </p>
                        </div>
                    ) : contest.problems && contest.problems.length > 0 ? (
                        <div style={styles.problemsList}>
                            {contest.problems.map((problem, index) => (
                                <Link
                                    key={problem.id}
                                    to={`/problems/${problem.id}`}
                                    style={styles.problemRow}>
                                    <div style={styles.problemLeft}>
                                        <span style={styles.problemIndex}>
                                            {String.fromCharCode(65 + index)}
                                        </span>
                                        <span style={styles.problemTitle}>
                                            {problem.title}
                                        </span>
                                    </div>
                                    <span style={{
                                        ...styles.diffBadge,
                                        color: getDiffStyle(problem.difficulty).color,
                                        background: getDiffStyle(
                                            problem.difficulty).bg,
                                    }}>
                                        {problem.difficulty}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div style={styles.lockedCard}>
                            <Code2 size={40} color="#374151" />
                            <p style={styles.lockedTitle}>
                                No problems added yet
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: 'calc(100vh - 64px)',
        background: '#0a0e1a',
        padding: '32px 0 60px',
    },
    container: {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 24px',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 64px)',
        background: '#0a0e1a',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#6b7280',
        fontSize: '14px',
        marginBottom: '20px',
        textDecoration: 'none',
    },
    hero: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '18px',
        padding: '28px',
        marginBottom: '24px',
    },
    heroTop: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 14px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    liveDot: {
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#10b981',
        animation: 'pulse 1.5s infinite',
    },
    joinBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
    },
    title: {
        fontSize: '26px',
        fontWeight: '800',
        color: '#f9fafb',
        marginBottom: '8px',
        letterSpacing: '-0.5px',
    },
    description: {
        fontSize: '14px',
        color: '#9ca3af',
        lineHeight: '1.6',
        marginBottom: '20px',
    },
    countdownBox: {
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        padding: '20px',
        marginBottom: '20px',
        textAlign: 'center',
    },
    countdownLabel: {
        fontSize: '13px',
        color: '#6b7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '14px',
    },
    countdownTimer: {
        display: 'flex',
        justifyContent: 'center',
        gap: '20px',
    },
    timeUnit: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minWidth: '50px',
    },
    timeValue: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#3b82f6',
        fontFamily: "'JetBrains Mono', monospace",
        letterSpacing: '-1px',
    },
    timeLabel: {
        fontSize: '11px',
        color: '#6b7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '4px',
    },
    metaGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 16px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
    },
    metaLabel: {
        fontSize: '11px',
        color: '#6b7280',
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    metaValue: {
        fontSize: '13px',
        color: '#f9fafb',
        fontWeight: '600',
        marginTop: '2px',
    },
    problemsSection: {
        marginBottom: '24px',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '16px',
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: '16px',
    },
    lockedCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        padding: '60px 20px',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        textAlign: 'center',
    },
    lockedTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#4b5563',
    },
    lockedSubtext: {
        fontSize: '13px',
        color: '#374151',
        maxWidth: '320px',
        lineHeight: '1.6',
    },
    problemsList: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    problemRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderBottom: '1px solid #1e2d45',
        textDecoration: 'none',
        transition: 'background 0.15s',
    },
    problemLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
    },
    problemIndex: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '700',
        color: '#60a5fa',
    },
    problemTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f9fafb',
    },
    diffBadge: {
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
}