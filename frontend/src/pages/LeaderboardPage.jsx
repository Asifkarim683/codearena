import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'
import {
    Trophy, Medal, Crown,
    ChevronLeft, ChevronRight, Loader2
} from 'lucide-react'
import './LeaderboardPage.css'

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
            <div className="rank-badge" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                <Crown size={14} />
                1
            </div>
        )
        if (rank === 2) return (
            <div className="rank-badge" style={{ background: 'linear-gradient(135deg, #9ca3af, #6b7280)' }}>
                <Medal size={14} />
                2
            </div>
        )
        if (rank === 3) return (
            <div className="rank-badge" style={{ background: 'linear-gradient(135deg, #cd7c2f, #a85c1c)' }}>
                <Medal size={14} />
                3
            </div>
        )
        return <span className="rank-number">#{rank}</span>
    }

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short'
        })

    return (
        <div className="leaderboard-page">
            {/* Glowing Blur Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>
            <div className="blob blob-blue"></div>

            <div className="leaderboard-container">
                {/* Header */}
                <div className="leaderboard-header">
                    <div className="leaderboard-header-left">
                        <div className="leaderboard-header-icon">
                            <Trophy size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <h1 className="leaderboard-title">Leaderboard</h1>
                            <p className="leaderboard-subtitle">
                                Top coders ranked by problems solved
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top 3 Podium */}
                {page === 0 && leaderboard.length >= 3 && (
                    <div className="leaderboard-podium">
                        {/* 2nd Place */}
                        <div className="podium-card">
                            <div 
                                className="podium-avatar"
                                style={{ background: 'linear-gradient(135deg, #9ca3af, #6b7280)' }}
                            >
                                {leaderboard[1]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="podium-rank-badge">
                                🥈 2nd
                            </div>
                            <Link
                                to={`/profile/${leaderboard[1]?.username}`}
                                className="podium-name">
                                {leaderboard[1]?.username}
                            </Link>
                            <div className="podium-solved">
                                {leaderboard[1]?.solved} solved
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="podium-card podium-first">
                            <div className="crown-icon">👑</div>
                            <div 
                                className="podium-avatar"
                                style={{
                                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    width: '72px',
                                    height: '72px',
                                    fontSize: '28px',
                                }}
                            >
                                {leaderboard[0]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="podium-rank-badge">
                                🥇 1st
                            </div>
                            <Link
                                to={`/profile/${leaderboard[0]?.username}`}
                                className="podium-name">
                                {leaderboard[0]?.username}
                            </Link>
                            <div className="podium-solved">
                                {leaderboard[0]?.solved} solved
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="podium-card">
                            <div 
                                className="podium-avatar"
                                style={{ background: 'linear-gradient(135deg, #cd7c2f, #a85c1c)' }}
                            >
                                {leaderboard[2]?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div className="podium-rank-badge">
                                🥉 3rd
                            </div>
                            <Link
                                to={`/profile/${leaderboard[2]?.username}`}
                                className="podium-name">
                                {leaderboard[2]?.username}
                            </Link>
                            <div className="podium-solved">
                                {leaderboard[2]?.solved} solved
                            </div>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="leaderboard-table-card">
                    {loading ? (
                        <div className="leaderboard-loading">
                            <Loader2 size={32} color="#3b82f6"
                                style={{ animation: 'spin 1s linear infinite' }} />
                        </div>
                    ) : (
                        <table className="leaderboard-table">
                            <thead>
                                <tr>
                                    <th className="leaderboard-th">Rank</th>
                                    <th className="leaderboard-th">User</th>
                                    <th className="leaderboard-th">Problems Solved</th>
                                    <th className="leaderboard-th">Member Since</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry) => {
                                    const isCurrentUser =
                                        entry.username === currentUser?.username
                                    return (
                                        <tr
                                            key={entry.rank}
                                            className={`leaderboard-row${isCurrentUser ? ' leaderboard-current-user-row' : ''}`}
                                        >
                                            <td className="leaderboard-td">
                                                {getRankDisplay(entry.rank)}
                                            </td>
                                            <td className="leaderboard-td">
                                                <div className="user-cell">
                                                    <div 
                                                        className="user-avatar"
                                                        style={{
                                                            background: entry.rank === 1
                                                                ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                                                                : entry.rank === 2
                                                                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                                                                    : entry.rank === 3
                                                                        ? 'linear-gradient(135deg, #cd7c2f, #a85c1c)'
                                                                        : 'linear-gradient(135deg, #3b82f6, #2563eb)'
                                                        }}
                                                    >
                                                        {entry.username?.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <Link
                                                            to={`/profile/${entry.username}`}
                                                            className="user-username-link">
                                                            {entry.username}
                                                        </Link>
                                                        {isCurrentUser && (
                                                            <span className="you-badge">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="leaderboard-td">
                                                <div className="solved-cell">
                                                    <div 
                                                        className="solved-bar"
                                                        style={{
                                                            width: `${Math.min(100, (entry.solved / (leaderboard[0]?.solved || 1)) * 100)}%`
                                                        }} 
                                                    />
                                                    <span className="solved-num">
                                                        {entry.solved}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="leaderboard-td">
                                                <span className="member-date">
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
                <div className="leaderboard-pagination">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="leaderboard-page-btn"
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <span className="leaderboard-page-info">
                        Page {page + 1}
                    </span>
                    <button
                        onClick={() => setPage(p => p + 1)}
                        disabled={leaderboard.length < size}
                        className="leaderboard-page-btn"
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}