import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { contestService } from '../services/contestService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    ArrowLeft, Trophy, Medal, Crown,
    Loader2, CheckCircle2, Clock
} from 'lucide-react'

export default function ContestScoreboardPage() {
    const { id } = useParams()
    const { user: currentUser } = useAuth()
    const [contest, setContest] = useState(null)
    const [scoreboard, setScoreboard] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [id])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [contestRes, scoreRes] = await Promise.all([
                contestService.getContestById(id),
                contestService.getScoreboard(id),
            ])
            setContest(contestRes.data)
            setScoreboard(scoreRes.data || [])
        } catch (error) {
            toast.error('Failed to load scoreboard')
        } finally {
            setLoading(false)
        }
    }

    const getRankDisplay = (rank) => {
        if (rank === 1) return (
            <div style={{ ...styles.rankBadge, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Crown size={14} />1
            </div>
        )
        if (rank === 2) return (
            <div style={{ ...styles.rankBadge, background: 'linear-gradient(135deg, #9ca3af, #6b7280)' }}>
                <Medal size={14} />2
            </div>
        )
        if (rank === 3) return (
            <div style={{ ...styles.rankBadge, background: 'linear-gradient(135deg, #cd7c2f, #a85c1c)' }}>
                <Medal size={14} />3
            </div>
        )
        return <span style={styles.rankNumber}>#{rank}</span>
    }

    const formatTime = (d) => d
        ? new Date(d).toLocaleString('en-IN', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })
        : '—'

    if (loading) return (
        <div style={styles.loadingContainer}>
            <Loader2 size={40} color="#3b82f6"
                style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    )

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                <Link to={`/contests/${id}`} style={styles.backBtn}>
                    <ArrowLeft size={16} />
                    Back to Contest
                </Link>

                <div style={styles.header}>
                    <div style={styles.headerIcon}>
                        <Trophy size={24} color="#f59e0b" />
                    </div>
                    <div>
                        <h1 style={styles.title}>
                            {contest?.title} — Scoreboard
                        </h1>
                        <p style={styles.subtitle}>
                            Ranked by score, then earliest finish time
                        </p>
                    </div>
                </div>

                <div style={styles.tableCard}>
                    {scoreboard.length === 0 ? (
                        <div style={styles.empty}>
                            <Trophy size={48} color="#374151" />
                            <p style={styles.emptyText}>
                                No submissions yet
                            </p>
                            <p style={styles.emptySubtext}>
                                Be the first to solve a problem!
                            </p>
                        </div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Rank</th>
                                    <th style={styles.th}>User</th>
                                    <th style={styles.th}>Score</th>
                                    <th style={styles.th}>Solved</th>
                                    <th style={styles.th}>Last Accepted</th>
                                </tr>
                            </thead>
                            <tbody>
                                {scoreboard.map(entry => {
                                    const isMe = entry.username === currentUser?.username
                                    return (
                                        <tr key={entry.rank} style={{
                                            ...styles.row,
                                            ...(isMe ? styles.myRow : {})
                                        }}>
                                            <td style={styles.td}>
                                                {getRankDisplay(entry.rank)}
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.userCell}>
                                                    <div style={{
                                                        ...styles.avatar,
                                                        background: entry.rank === 1
                                                            ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                                            : entry.rank === 2
                                                                ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                                                                : entry.rank === 3
                                                                    ? 'linear-gradient(135deg, #cd7c2f, #a85c1c)'
                                                                    : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                                    }}>
                                                        {entry.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <Link
                                                        to={`/profile/${entry.username}`}
                                                        style={styles.username}>
                                                        {entry.username}
                                                    </Link>
                                                    {isMe && (
                                                        <span style={styles.youBadge}>You</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.score}>
                                                    {entry.score}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.solved}>
                                                    <CheckCircle2 size={14} color="#10b981" />
                                                    {entry.solvedCount} / {entry.totalProblems}
                                                </span>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.time}>
                                                    <Clock size={13} />
                                                    {formatTime(entry.lastSubmissionTime)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
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
        maxWidth: '900px',
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
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '24px',
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
        fontSize: '22px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.4px',
    },
    subtitle: {
        fontSize: '13px',
        color: '#6b7280',
        marginTop: '4px',
    },
    tableCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '14px 20px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid #1e2d45',
        background: '#0f172a',
    },
    td: {
        padding: '14px 20px',
        borderBottom: '1px solid #1e2d45',
        fontSize: '14px',
    },
    row: {
        transition: 'background 0.15s',
    },
    myRow: {
        background: 'rgba(59,130,246,0.05)',
        borderLeft: '3px solid #3b82f6',
    },
    rankBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '5px 10px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '700',
        color: 'white',
    },
    rankNumber: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#6b7280',
    },
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    avatar: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '700',
        color: 'white',
        flexShrink: 0,
    },
    username: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f9fafb',
        textDecoration: 'none',
    },
    youBadge: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#3b82f6',
        background: 'rgba(59,130,246,0.1)',
        padding: '2px 8px',
        borderRadius: '10px',
    },
    score: {
        fontSize: '15px',
        fontWeight: '800',
        color: '#f59e0b',
    },
    solved: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#9ca3af',
        fontWeight: '600',
    },
    time: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '12px',
        color: '#6b7280',
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '60px 20px',
    },
    emptyText: {
        fontSize: '16px',
        color: '#4b5563',
        fontWeight: '600',
    },
    emptySubtext: {
        fontSize: '13px',
        color: '#374151',
    },
}