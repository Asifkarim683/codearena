import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
    Trophy, Medal, Crown,
    ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'

export default function LeaderboardPage() {
    const { user: currentUser } = useAuth()
    const [leaderboard, setLeaderboard] = useState([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(0)
    const size = 20

    useEffect(() => {
        fetchLeaderboard()
    }, [page])

    const fetchLeaderboard = async () => {
        setLoading(true)
        try {
            const res = await api.get(
                `/leaderboard?page=${page}&size=${size}`)
            setLeaderboard(res.data.data || [])
        } catch (error) {
            toast.error('Failed to load leaderboard')
        } finally {
            setLoading(false)
        }
    }

    const getRankDisplay = (rank) => {
        if (rank === 1) return (
            <div style={{ ...styles.rankBadge, background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Crown size={14} />
                1
            </div>
        )
        if (rank === 2) return (
            <div style={{ ...styles.rankBadge, background: 'linear-gradient(135deg, #9ca3af, #6b7280)' }}>
                <Medal size={14} />
                2
            </div>
        )
        if (rank === 3) return (
            <div style={{ ...styles.rankBadge, background: 'linear-gradient(135deg, #cd7c2f, #a85c1c)' }}>
                <Medal size={14} />
                3
            </div>
        )
        return <span style={styles.rankNumber}>#{rank}</span>
    }

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short'
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
                            <h1 style={styles.title}>Leaderboard</h1>
                            <p style={styles.subtitle}>
                                Top coders ranked by problems solved
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top 3 Podium */}
                {page === 0 && leaderboard.length >= 3 && (
                    <div style={styles.podium}>
                        {/* 2nd Place */}
                        <div style={styles.podiumCard}>
                            <div style={{
                                ...styles.podiumAvatar,
                                background: 'linear-gradient(135deg, #9ca3af, #6b7280)'
                            }}>
                                {leaderboard[1]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={styles.podiumRankBadge}>
                                🥈 2nd
                            </div>
                            <Link
                                to={`/profile/${leaderboard[1]?.username}`}
                                style={styles.podiumName}>
                                {leaderboard[1]?.username}
                            </Link>
                            <div style={styles.podiumSolved}>
                                {leaderboard[1]?.solved} solved
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div style={{
                            ...styles.podiumCard,
                            ...styles.podiumFirst
                        }}>
                            <div style={styles.crownIcon}>👑</div>
                            <div style={{
                                ...styles.podiumAvatar,
                                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                width: '72px',
                                height: '72px',
                                fontSize: '28px',
                            }}>
                                {leaderboard[0]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={styles.podiumRankBadge}>
                                🥇 1st
                            </div>
                            <Link
                                to={`/profile/${leaderboard[0]?.username}`}
                                style={styles.podiumName}>
                                {leaderboard[0]?.username}
                            </Link>
                            <div style={styles.podiumSolved}>
                                {leaderboard[0]?.solved} solved
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div style={styles.podiumCard}>
                            <div style={{
                                ...styles.podiumAvatar,
                                background: 'linear-gradient(135deg, #cd7c2f, #a85c1c)'
                            }}>
                                {leaderboard[2]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div style={styles.podiumRankBadge}>
                                🥉 3rd
                            </div>
                            <Link
                                to={`/profile/${leaderboard[2]?.username}`}
                                style={styles.podiumName}>
                                {leaderboard[2]?.username}
                            </Link>
                            <div style={styles.podiumSolved}>
                                {leaderboard[2]?.solved} solved
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div style={styles.tableCard}>
                    {loading ? (
                        <div style={styles.loadingDiv}>
                            <Loader2 size={32} color="#3b82f6"
                                style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Rank</th>
                                    <th style={styles.th}>User</th>
                                    <th style={styles.th}>Problems Solved</th>
                                    <th style={styles.th}>Member Since</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry) => {
                                    const isCurrentUser =
                                        entry.username === currentUser?.username
                                    return (
                                        <tr
                                            key={entry.rank}
                                            style={{
                                                ...styles.row,
                                                ...(isCurrentUser
                                                    ? styles.currentUserRow : {})
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
                                                    <div>
                                                        <Link
                                                            to={`/profile/${entry.username}`}
                                                            style={styles.username}>
                                                            {entry.username}
                                                        </Link>
                                                        {isCurrentUser && (
                                                            <span style={styles.youBadge}>
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <div style={styles.solvedCell}>
                                                    <div style={{
                                                        ...styles.solvedBar,
                                                        width: `${Math.min(100, (entry.solved / (leaderboard[0]?.solved || 1)) * 100)}%`
                                                    }} />
                                                    <span style={styles.solvedNum}>
                                                        {entry.solved}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={styles.td}>
                                                <span style={styles.date}>
                                                    {formatDate(entry.memberSince)}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                <div style={styles.pagination}>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{
                            ...styles.pageBtn,
                            opacity: page === 0 ? 0.4 : 1
                        }}>
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <span style={styles.pageInfo}>
                        Page {page + 1}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={leaderboard.length < size}
                        style={{
                            ...styles.pageBtn,
                            opacity: leaderboard.length < size ? 0.4 : 1
                        }}>
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: 'calc(100vh - 64px)',
        background: '#0a0e1a',
        padding: '32px 0',
    },
    container: {
        maxWidth: '900px',
        margin: '0 auto',
        padding: '0 24px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
    podium: {
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        gap: '16px',
        marginBottom: '32px',
        padding: '24px',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '16px',
    },
    podiumCard: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        flex: 1,
        maxWidth: '160px',
    },
    podiumFirst: {
        transform: 'translateY(-16px)',
    },
    crownIcon: {
        fontSize: '24px',
    },
    podiumAvatar: {
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '22px',
        fontWeight: '800',
        color: 'white',
    },
    podiumRankBadge: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#f9fafb',
    },
    podiumName: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#f9fafb',
        textDecoration: 'none',
        textAlign: 'center',
    },
    podiumSolved: {
        fontSize: '12px',
        color: '#6b7280',
    },
    tableCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '24px',
    },
    loadingDiv: {
        display: 'flex',
        justifyContent: 'center',
        padding: '60px',
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
    currentUserRow: {
        background: 'rgba(59, 130, 246, 0.05)',
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
        gap: '12px',
    },
    avatar: {
        width: '36px',
        height: '36px',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '15px',
        fontWeight: '700',
        color: 'white',
        flexShrink: 0,
    },
    username: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f9fafb',
        textDecoration: 'none',
        display: 'block',
    },
    youBadge: {
        fontSize: '11px',
        fontWeight: '600',
        color: '#3b82f6',
        background: 'rgba(59, 130, 246, 0.1)',
        padding: '2px 8px',
        borderRadius: '10px',
        marginLeft: '8px',
    },
    solvedCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    solvedBar: {
        height: '6px',
        background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
        borderRadius: '3px',
        minWidth: '4px',
        maxWidth: '120px',
        transition: 'width 0.3s ease',
    },
    solvedNum: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#f9fafb',
    },
    date: {
        fontSize: '13px',
        color: '#6b7280',
    },
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
    },
    pageBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#9ca3af',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    pageInfo: {
        fontSize: '14px',
        color: '#6b7280',
    },
}