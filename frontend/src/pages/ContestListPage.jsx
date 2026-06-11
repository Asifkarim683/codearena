import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { contestService } from '../services/contestService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    Trophy, Calendar, Clock, Users,
    ArrowRight, Loader2, Zap, CheckCircle2
} from 'lucide-react'

export default function ContestListPage() {
    const { isAdmin } = useAuth()
    const [contests, setContests] = useState([])
    const [loading, setLoading] = useState(true)
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        fetchContests()
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [])

    const fetchContests = async () => {
        setLoading(true)
        try {
            const res = await contestService.getContests()
            setContests(res.data || [])
        } catch (error) {
            toast.error('Failed to load contests')
        } finally {
            setLoading(false)
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

    const getCountdown = (targetDate, status) => {
        const target = new Date(targetDate)
        const diff = target - now
        if (diff <= 0) return null

        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
        const minutes = Math.floor((diff / (1000 * 60)) % 60)
        const seconds = Math.floor((diff / 1000) % 60)

        if (days > 0) return `${days}d ${hours}h ${minutes}m`
        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
        return `${minutes}m ${seconds}s`
    }

    const formatDateTime = (d) =>
        new Date(d).toLocaleString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })

    // Sort: ongoing first, then upcoming, then ended
    const sortedContests = [...contests].sort((a, b) => {
        const order = { ONGOING: 0, UPCOMING: 1, ENDED: 2 }
        return order[a.status] - order[b.status]
    })

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerIcon}>
                            <Trophy size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <h1 style={styles.title}>Contests</h1>
                            <p style={styles.subtitle}>
                                Compete with others and climb the leaderboard
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div style={styles.loadingDiv}>
                        <Loader2 size={32} color="#3b82f6"
                            style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : sortedContests.length === 0 ? (
                    <div style={styles.empty}>
                        <Trophy size={48} color="#374151" />
                        <p style={styles.emptyText}>No contests yet</p>
                        <p style={styles.emptySubtext}>
                            Check back later for upcoming contests
                        </p>
                    </div>
                ) : (
                    <div style={styles.contestGrid}>
                        {sortedContests.map(contest => {
                            const statusStyle = getStatusStyle(contest.status)
                            const countdown = contest.status === 'UPCOMING'
                                ? getCountdown(contest.startTime, contest.status)
                                : contest.status === 'ONGOING'
                                    ? getCountdown(contest.endTime, contest.status)
                                    : null

                            return (
                                <Link
                                    key={contest.id}
                                    to={`/contests/${contest.id}`}
                                    style={styles.contestCard}>

                                    {/* Status Badge */}
                                    <div style={styles.cardTop}>
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
                                        {contest.status !== 'ENDED' && (
                                            <span style={styles.problemCount}>
                                                {contest.totalProblems} problems
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 style={styles.contestTitle}>
                                        {contest.title}
                                    </h3>
                                    <p style={styles.contestDesc}>
                                        {contest.description}
                                    </p>

                                    {/* Countdown */}
                                    {countdown && (
                                        <div style={{
                                            ...styles.countdown,
                                            background: statusStyle.bg,
                                            color: statusStyle.color,
                                        }}>
                                            <Clock size={14} />
                                            {contest.status === 'UPCOMING'
                                                ? `Starts in ${countdown}`
                                                : `Ends in ${countdown}`}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div style={styles.cardFooter}>
                                        <div style={styles.footerItem}>
                                            <Calendar size={13} />
                                            {formatDateTime(contest.startTime)}
                                        </div>
                                        <div style={styles.footerItem}>
                                            <Users size={13} />
                                            {contest.totalParticipants} joined
                                        </div>
                                    </div>

                                    <div style={styles.viewBtn}>
                                        View Contest
                                        <ArrowRight size={14} />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
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
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
    },
    header: {
        marginBottom: '32px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    headerIcon: {
        width: '52px',
        height: '52px',
        background: 'rgba(245, 158, 11, 0.1)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    title: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '4px',
    },
    loadingDiv: {
        display: 'flex',
        justifyContent: 'center',
        padding: '80px',
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '80px 20px',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
    },
    emptyText: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
    },
    emptySubtext: {
        fontSize: '14px',
        color: '#4b5563',
    },
    contestGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px',
    },
    contestCard: {
        display: 'flex',
        flexDirection: 'column',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '16px',
        padding: '22px',
        textDecoration: 'none',
        transition: 'all 0.2s',
        position: 'relative',
    },
    cardTop: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '14px',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
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
    problemCount: {
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '500',
    },
    contestTitle: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: '8px',
        letterSpacing: '-0.2px',
    },
    contestDesc: {
        fontSize: '13px',
        color: '#6b7280',
        lineHeight: '1.6',
        marginBottom: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        flex: 1,
    },
    countdown: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        marginBottom: '14px',
    },
    cardFooter: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        marginBottom: '16px',
        paddingBottom: '16px',
        borderBottom: '1px solid #1e2d45',
    },
    footerItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#6b7280',
    },
    viewBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#3b82f6',
    },
}