import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { contestService } from '../services/contestService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    Trophy, Calendar, Clock, Users,
    ArrowRight, Loader2
} from 'lucide-react'
import './ContestListPage.css'

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
                return { color: '#10b981', bg: 'rgba(16,185,129,0.08)', label: 'Live Now' }
            case 'UPCOMING':
                return { color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', label: 'Upcoming' }
            case 'ENDED':
                return { color: '#64748b', bg: 'rgba(107,114,128,0.08)', label: 'Ended' }
            default:
                return { color: '#64748b', bg: 'rgba(107,114,128,0.08)', label: status }
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
        <div className="contest-page">
            {/* Glowing Blur Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>
            <div className="blob blob-blue"></div>

            <div className="contest-container">
                {/* Header */}
                <div className="contest-header">
                    <div className="contest-header-left">
                        <div className="contest-header-icon">
                            <Trophy size={24} color="#f59e0b" />
                        </div>
                        <div>
                            <h1 className="contest-title">Contests</h1>
                            <p className="contest-subtitle">
                                Compete with others and climb the leaderboard
                            </p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="contest-loading">
                        <Loader2 size={32} color="#3b82f6"
                            style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                ) : sortedContests.length === 0 ? (
                    <div className="contest-empty">
                        <Trophy size={48} color="#94a3b8" />
                        <p className="contest-empty-text">No contests yet</p>
                        <p className="contest-empty-subtext">
                            Check back later for upcoming contests
                        </p>
                    </div>
                ) : (
                    <div className="contest-grid">
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
                                    className="contest-card"
                                >
                                    {/* Status Badge */}
                                    <div className="card-top">
                                        <span 
                                            className="status-badge"
                                            style={{
                                                color: statusStyle.color,
                                                background: statusStyle.bg,
                                            }}
                                        >
                                            {contest.status === 'ONGOING' && (
                                                <span className="live-dot" />
                                            )}
                                            {statusStyle.label}
                                        </span>
                                        {contest.status !== 'ENDED' && (
                                            <span className="problem-count">
                                                {contest.totalProblems} problems
                                            </span>
                                        )}
                                    </div>

                                    {/* Title */}
                                    <h3 className="contest-card-title">
                                        {contest.title}
                                    </h3>
                                    <p className="contest-desc">
                                        {contest.description}
                                    </p>

                                    {/* Countdown */}
                                    {countdown && (
                                        <div 
                                            className="countdown-box"
                                            style={{
                                                background: statusStyle.bg,
                                                color: statusStyle.color,
                                            }}
                                        >
                                            <Clock size={14} />
                                            {contest.status === 'UPCOMING'
                                                ? `Starts in ${countdown}`
                                                : `Ends in ${countdown}`}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="card-footer">
                                        <div className="footer-item">
                                            <Calendar size={13} />
                                            {formatDateTime(contest.startTime)}
                                        </div>
                                        <div className="footer-item">
                                            <Users size={13} />
                                            {contest.totalParticipants} joined
                                        </div>
                                    </div>

                                    <div className="view-btn">
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