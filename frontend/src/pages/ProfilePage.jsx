import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { submissionService } from '../services/submissionService'
import { contestService } from '../services/contestService'
import toast from 'react-hot-toast'
import {
    User, Calendar, Code2, CheckCircle2,
    XCircle, Clock, AlertCircle, Trophy,
    ArrowLeft, Loader2, Target, Zap,
    BarChart2, Award, Hash
} from 'lucide-react'
import './ProfilePage.css'

export default function ProfilePage() {
    const { username } = useParams()
    const { user: currentUser } = useAuth()
    const [profile, setProfile] = useState(null)
    const [submissions, setSubmissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('submissions')
    const [contestStats, setContestStats] = useState([])

    useEffect(() => {
        fetchProfile()
    }, [username])

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const profileRes = await api.get(`/users/${username}`)
            setProfile(profileRes.data.data)
            if (currentUser?.username === username) {
                const subRes = await submissionService
                    .getMySubmissions(0, 100)
                const subs = subRes.data.content || []
                setSubmissions(subs)
                await buildContestStats(subs)
            }
        } catch (error) {
            toast.error('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }

    const buildContestStats = async (subs) => {
        const accepted = subs.filter(
            s => s.verdict === 'ACCEPTED' && s.contestId)

        // Group by contestId -> unique problems -> sum points
        const contestMap = new Map()
        for (const sub of accepted) {
            if (!contestMap.has(sub.contestId)) {
                contestMap.set(sub.contestId, {
                    contestId: sub.contestId,
                    score: 0,
                    solvedProblemIds: new Set(),
                })
            }
            const entry = contestMap.get(sub.contestId)
            if (!entry.solvedProblemIds.has(sub.problemId)) {
                entry.solvedProblemIds.add(sub.problemId)
                entry.score += sub.points || 0
            }
        }

        if (contestMap.size === 0) {
            setContestStats([])
            return
        }

        // Fetch contest details for titles + totals
        const results = await Promise.all(
            Array.from(contestMap.values()).map(async (entry) => {
                try {
                    const res = await contestService.getContestById(
                        entry.contestId)

                    return {
                        contestId: entry.contestId,
                        title: res.data.title,
                        status: res.data.status,
                        score: entry.score,
                        solvedCount: entry.solvedProblemIds.size,
                        totalProblems: res.data.totalProblems,
                        startTime: res.data.startTime,
                    }
                } catch {
                    return null
                }
            })
        )

        setContestStats(results.filter(Boolean))
    }

    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'ACCEPTED':
                return { color: '#10b981', bg: 'rgba(16, 185, 129, 0.08)', icon: CheckCircle2 }
            case 'WRONG_ANSWER':
                return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', icon: XCircle }
            case 'TIME_LIMIT_EXCEEDED':
                return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', icon: Clock }
            case 'COMPILATION_ERROR':
                return { color: '#6366f1', bg: 'rgba(99, 102, 241, 0.08)', icon: AlertCircle }
            case 'RUNTIME_ERROR':
                return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.08)', icon: AlertCircle }
            default:
                return { color: '#64748b', bg: 'rgba(100, 116, 139, 0.08)', icon: AlertCircle }
        }
    }

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'short', day: 'numeric'
        })

    const formatVerdict = (v) => v?.replace(/_/g, ' ') || 'UNKNOWN'

    // Computed stats
    const accepted = submissions.filter(
        s => s.verdict === 'ACCEPTED').length
    const wrongAnswer = submissions.filter(
        s => s.verdict === 'WRONG_ANSWER').length
    const tle = submissions.filter(
        s => s.verdict === 'TIME_LIMIT_EXCEEDED').length
    const ce = submissions.filter(
        s => s.verdict === 'COMPILATION_ERROR').length
    const total = submissions.length
    const acceptanceRate = total > 0
        ? ((accepted / total) * 100).toFixed(1) : 0

    // Most used language
    const langCount = submissions.reduce((acc, s) => {
        acc[s.language] = (acc[s.language] || 0) + 1
        return acc
    }, {})
    const favoriteLanguage = Object.keys(langCount).length > 0
        ? Object.entries(langCount).sort((a, b) => b[1] - a[1])[0][0]
        : 'N/A'

    // Unique solved problems
    const solvedProblems = [
        ...new Map(
            submissions
                .filter(s => s.verdict === 'ACCEPTED')
                .map(s => [s.problemId, s])
        ).values()
    ]

    const isOwnProfile = currentUser?.username === username

    if (loading) return (
        <div className="profile-loading">
            <Loader2 size={40} color="#3b82f6"
                style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#64748b', marginTop: '16px', fontWeight: '600' }}>
                Loading profile...
            </p>
        </div>
    )

    if (!profile) return (
        <div className="profile-loading">
            <p style={{ color: '#64748b', fontWeight: '600' }}>User not found</p>
        </div>
    )

    return (
        <div className="profile-page">
            {/* Background Blobs */}
            <div className="blob blob-pink" />
            <div className="blob blob-mint" />
            <div className="blob blob-blue" />

            <div className="profile-container">

                {/* Back Button */}
                <Link to="/problems" className="profile-back-btn">
                     <ArrowLeft size={16} />
                     Back to Problems
                </Link>

                {/* ── Hero Card ── */}
                <div className="profile-hero-card">
                    <div className="profile-hero-bg" />
                    <div className="profile-hero-content">
                        <div className="profile-avatar-wrapper">
                            <div className="profile-avatar-large">
                                {profile.username?.charAt(0).toUpperCase()}
                            </div>
                            {profile.role === 'ADMIN' && (
                                <div className="profile-admin-dot" title="Admin" />
                            )}
                        </div>
                        <div className="profile-hero-info">
                            <div className="profile-name-row">
                                <h1 className="profile-name">
                                    {profile.username}
                                </h1>
                                {profile.role === 'ADMIN' && (
                                    <span className="profile-admin-badge">
                                        <Award size={12} />
                                        Admin
                                    </span>
                                )}
                                {isOwnProfile && (
                                    <span className="profile-you-badge">You</span>
                                )}
                            </div>
                            <p className="profile-email">{profile.email}</p>
                            <div className="profile-hero-meta">
                                <span className="profile-meta-chip">
                                    <Calendar size={13} />
                                    Joined {formatDate(profile.memberSince)}
                                </span>
                                {isOwnProfile && favoriteLanguage !== 'N/A' && (
                                    <span className="profile-meta-chip">
                                        <Code2 size={13} />
                                        {favoriteLanguage}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div className="profile-stats-grid">
                    <div className="profile-stat-card">
                        <div className="profile-stat-icon">
                            <Target size={20} color="#3b82f6" />
                        </div>
                        <div className="profile-stat-value" >
                            {profile.totalSolved || 0}
                        </div>
                        <div className="profile-stat-label">Problems Solved</div>
                    </div>

                    {isOwnProfile && (
                        <>
                            <div className="profile-stat-card">
                                <div className="profile-stat-icon">
                                    <CheckCircle2 size={20} color="#10b981" />
                                </div>
                                <div className="profile-stat-value" style={{ color: '#10b981' }}>
                                    {accepted}
                                </div>
                                <div className="profile-stat-label">Accepted</div>
                            </div>

                            <div className="profile-stat-card">
                                <div className="profile-stat-icon">
                                    <BarChart2 size={20} color="#6366f1" />
                                </div>
                                <div className="profile-stat-value" style={{ color: '#6366f1' }}>
                                    {total}
                                </div>
                                <div className="profile-stat-label">
                                    Total Submissions
                                </div>
                            </div>

                            <div className="profile-stat-card">
                                <div className="profile-stat-icon">
                                    <Zap size={20} color="#f59e0b" />
                                </div>
                                <div className="profile-stat-value" style={{ color: '#f59e0b' }}>
                                    {acceptanceRate}%
                                </div>
                                <div className="profile-stat-label">
                                    Acceptance Rate
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Contest Performance (own profile only) ── */}
                {isOwnProfile && contestStats.length > 0 && (
                    <div className="profile-verdict-card">
                        <h3 className="profile-section-title">
                            <Trophy size={16} />
                            Contest Performance
                        </h3>
                        <div className="profile-contest-grid">
                            {contestStats.map(cs => (
                                <Link
                                    key={cs.contestId}
                                    to={`/contests/${cs.contestId}/scoreboard`}
                                    className="profile-contest-card">
                                    <div className="profile-contest-top">
                                        <div>
                                            <span className="profile-contest-title">
                                                {cs.title}
                                            </span>
                                            <div className="profile-contest-date">
                                                {formatDate(cs.startTime)}
                                            </div>
                                        </div>
                                        <span 
                                            className="profile-contest-status"
                                            style={{
                                                color: cs.status === 'ONGOING'
                                                    ? '#10b981'
                                                    : cs.status === 'UPCOMING'
                                                        ? '#3b82f6' : '#64748b',
                                                background: cs.status === 'ONGOING'
                                                    ? 'rgba(16,185,129,0.08)'
                                                    : cs.status === 'UPCOMING'
                                                        ? 'rgba(59,130,246,0.08)'
                                                        : 'rgba(100,116,139,0.08)',
                                            }}
                                        >
                                            {cs.status}
                                        </span>
                                    </div>
                                    <div className="profile-contest-body">
                                        <div className="profile-contest-score">
                                            <span className="profile-contest-score-value">
                                                {cs.score}
                                            </span>
                                             <span className="profile-contest-score-label">
                                                points
                                            </span>
                                        </div>
                                        <div className="profile-contest-solved">
                                            <CheckCircle2 size={14} color="#10b981" />
                                            {cs.solvedCount} / {cs.totalProblems} solved
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {isOwnProfile && total > 0 && (
                    <div className="profile-verdict-card">
                        <h3 className="profile-section-title">
                            <BarChart2 size={16} />
                            Submission Breakdown
                        </h3>
                        <div className="profile-verdict-grid">
                            {[
                                { label: 'Accepted', count: accepted, color: '#10b981' },
                                { label: 'Wrong Answer', count: wrongAnswer, color: '#ef4444' },
                                { label: 'TLE', count: tle, color: '#f59e0b' },
                                { label: 'Compile Error', count: ce, color: '#6366f1' },
                            ].map(item => (
                                <div key={item.label} className="profile-verdict-item">
                                    <div className="profile-verdict-item-top">
                                        <span 
                                            className="profile-verdict-dot" 
                                            style={{ background: item.color }} 
                                        />
                                        <span className="profile-verdict-label">
                                            {item.label}
                                        </span>
                                        <span className="profile-verdict-count" style={{ color: item.color }}>
                                            {item.count}
                                        </span>
                                    </div>
                                    <div className="profile-verdict-bar-bg">
                                        <div 
                                            className="profile-verdict-bar" 
                                            style={{
                                                width: total > 0
                                                    ? `${(item.count / total) * 100}%`
                                                    : '0%',
                                                background: item.color,
                                            }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tabs (own profile only) ── */}
                {isOwnProfile && (
                    <>
                        <div className="profile-tabs">
                            <button
                                onClick={() => setActiveTab('submissions')}
                                className={`profile-tab${activeTab === 'submissions' ? ' profile-tab-active' : ''}`}
                            >
                                <Hash size={14} />
                                Submissions ({total})
                            </button>
                            <button
                                onClick={() => setActiveTab('solved')}
                                className={`profile-tab${activeTab === 'solved' ? ' profile-tab-active' : ''}`}
                            >
                                <CheckCircle2 size={14} />
                                Solved Problems ({solvedProblems.length})
                            </button>
                        </div>

                        {/* Submissions Tab */}
                        {activeTab === 'submissions' && (
                            <div className="profile-table-card">
                                {submissions.length === 0 ? (
                                    <div className="profile-empty">
                                        <Code2 size={48} color="#64748b" />
                                        <p className="profile-empty-text">
                                             No submissions yet
                                        </p>
                                        <Link to="/problems" className="profile-solve-btn">
                                             Start Solving
                                        </Link>
                                    </div>
                                ) : (
                                    <table className="profile-table">
                                        <thead>
                                             <tr>
                                                 <th className="profile-th">#</th>
                                                 <th className="profile-th">Problem</th>
                                                 <th className="profile-th">Verdict</th>
                                                 <th className="profile-th">Language</th>
                                                 <th className="profile-th">Runtime</th>
                                                 <th className="profile-th">Date</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {submissions.map((sub, i) => {
                                                 const vs = getVerdictStyle(sub.verdict)
                                                 const VIcon = vs.icon
                                                 return (
                                                     <tr key={sub.id} className="profile-row">
                                                         <td className="profile-td" style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
                                                             {i + 1}
                                                         </td>
                                                         <td className="profile-td">
                                                             <Link
                                                                 to={`/problems/${sub.problemId}`}
                                                                 className="profile-problem-link">
                                                                 {sub.problemTitle}
                                                             </Link>
                                                         </td>
                                                         <td className="profile-td">
                                                             <span 
                                                                 className="profile-verdict-badge"
                                                                 style={{ color: vs.color, background: vs.bg }}
                                                             >
                                                                 <VIcon size={12} />
                                                                 {formatVerdict(sub.verdict)}
                                                             </span>
                                                         </td>
                                                         <td className="profile-td">
                                                             <span className="profile-lang-badge">
                                                                 {sub.language}
                                                             </span>
                                                         </td>
                                                         <td className="profile-td">
                                                             <span className="profile-runtime">
                                                                 {sub.runtimeMs
                                                                     ? `${sub.runtimeMs}ms` : '—'}
                                                             </span>
                                                         </td>
                                                         <td className="profile-td">
                                                             <span className="profile-date">
                                                                 {formatDate(sub.submittedAt)}
                                                             </span>
                                                         </td>
                                                     </tr>
                                                 )
                                             })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {/* Solved Problems Tab */}
                        {activeTab === 'solved' && (
                            <div className="profile-table-card">
                                {solvedProblems.length === 0 ? (
                                    <div className="profile-empty">
                                        <Trophy size={48} color="#64748b" />
                                        <p className="profile-empty-text">
                                             No solved problems yet
                                        </p>
                                        <Link to="/problems" className="profile-solve-btn">
                                             Start Solving
                                        </Link>
                                    </div>
                                ) : (
                                    <table className="profile-table">
                                        <thead>
                                             <tr>
                                                 <th className="profile-th">#</th>
                                                 <th className="profile-th">Problem</th>
                                                 <th className="profile-th">Language</th>
                                                 <th className="profile-th">Runtime</th>
                                                 <th className="profile-th">Solved On</th>
                                             </tr>
                                        </thead>
                                        <tbody>
                                             {solvedProblems.map((sub, i) => (
                                                 <tr key={sub.problemId} className="profile-row">
                                                     <td className="profile-td" style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600' }}>
                                                         {i + 1}
                                                     </td>
                                                     <td className="profile-td">
                                                         <Link
                                                             to={`/problems/${sub.problemId}`}
                                                             className="profile-problem-link">
                                                             {sub.problemTitle}
                                                         </Link>
                                                     </td>
                                                     <td className="profile-td">
                                                         <span className="profile-lang-badge">
                                                             {sub.language}
                                                         </span>
                                                     </td>
                                                     <td className="profile-td">
                                                         <span className="profile-runtime">
                                                             {sub.runtimeMs
                                                                 ? `${sub.runtimeMs}ms` : '—'}
                                                         </span>
                                                     </td>
                                                     <td className="profile-td">
                                                         <div className="profile-solved-on">
                                                             <CheckCircle2
                                                                 size={14}
                                                                 color="#10b981"
                                                             />
                                                             <span className="profile-date">
                                                                 {formatDate(sub.submittedAt)}
                                                             </span>
                                                         </div>
                                                     </td>
                                                 </tr>
                                             ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Private profile note */}
                {!isOwnProfile && (
                    <div className="profile-private-note">
                         <User size={20} color="#64748b" />
                         <p style={{ color: '#64748b', margin: 0, fontWeight: '600' }}>
                              Detailed stats are private
                         </p>
                    </div>
                )}
            </div>
        </div>
    )
}
}