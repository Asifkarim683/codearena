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
                return { color: '#10b981', bg: '#10b98118', icon: CheckCircle2 }
            case 'WRONG_ANSWER':
                return { color: '#ef4444', bg: '#ef444418', icon: XCircle }
            case 'TIME_LIMIT_EXCEEDED':
                return { color: '#f59e0b', bg: '#f59e0b18', icon: Clock }
            case 'COMPILATION_ERROR':
                return { color: '#6366f1', bg: '#6366f118', icon: AlertCircle }
            case 'RUNTIME_ERROR':
                return { color: '#f97316', bg: '#f9731618', icon: AlertCircle }
            default:
                return { color: '#6b7280', bg: '#6b728018', icon: AlertCircle }
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
        <div style={styles.loadingContainer}>
            <Loader2 size={40} color="#3b82f6"
                style={{ animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#6b7280', marginTop: '16px' }}>
                Loading profile...
            </p>
        </div>
    )

    if (!profile) return (
        <div style={styles.loadingContainer}>
            <p style={{ color: '#6b7280' }}>User not found</p>
        </div>
    )

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* Back Button */}
                <Link to="/problems" style={styles.backBtn}>
                    <ArrowLeft size={16} />
                    Back to Problems
                </Link>

                {/* ── Hero Card ── */}
                <div style={styles.heroCard}>
                    <div style={styles.heroBg} />
                    <div style={styles.heroContent}>
                        <div style={styles.avatarWrapper}>
                            <div style={styles.avatarLarge}>
                                {profile.username?.charAt(0).toUpperCase()}
                            </div>
                            {profile.role === 'ADMIN' && (
                                <div style={styles.adminDot} title="Admin" />
                            )}
                        </div>
                        <div style={styles.heroInfo}>
                            <div style={styles.heroNameRow}>
                                <h1 style={styles.heroName}>
                                    {profile.username}
                                </h1>
                                {profile.role === 'ADMIN' && (
                                    <span style={styles.adminBadge}>
                                        <Award size={12} />
                                        Admin
                                    </span>
                                )}
                                {isOwnProfile && (
                                    <span style={styles.youBadge}>You</span>
                                )}
                            </div>
                            <p style={styles.heroEmail}>{profile.email}</p>
                            <div style={styles.heroMeta}>
                                <span style={styles.metaChip}>
                                    <Calendar size={13} />
                                    Joined {formatDate(profile.memberSince)}
                                </span>
                                {isOwnProfile && favoriteLanguage !== 'N/A' && (
                                    <span style={styles.metaChip}>
                                        <Code2 size={13} />
                                        {favoriteLanguage}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Stats Grid ── */}
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>
                            <Target size={20} color="#3b82f6" />
                        </div>
                        <div style={styles.statValue} >
                            {profile.totalSolved || 0}
                        </div>
                        <div style={styles.statLabel}>Problems Solved</div>
                    </div>

                    {isOwnProfile && (
                        <>
                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>
                                    <CheckCircle2 size={20} color="#10b981" />
                                </div>
                                <div style={{
                                    ...styles.statValue, color: '#10b981'
                                }}>
                                    {accepted}
                                </div>
                                <div style={styles.statLabel}>Accepted</div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>
                                    <BarChart2 size={20} color="#6366f1" />
                                </div>
                                <div style={{
                                    ...styles.statValue, color: '#6366f1'
                                }}>
                                    {total}
                                </div>
                                <div style={styles.statLabel}>
                                    Total Submissions
                                </div>
                            </div>

                            <div style={styles.statCard}>
                                <div style={styles.statIcon}>
                                    <Zap size={20} color="#f59e0b" />
                                </div>
                                <div style={{
                                    ...styles.statValue, color: '#f59e0b'
                                }}>
                                    {acceptanceRate}%
                                </div>
                                <div style={styles.statLabel}>
                                    Acceptance Rate
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* ── Contest Performance (own profile only) ── */}
                {isOwnProfile && contestStats.length > 0 && (
                    <div style={styles.verdictCard}>
                        <h3 style={styles.sectionTitle}>
                            <Trophy size={16} />
                            Contest Performance
                        </h3>
                        <div style={styles.contestStatsGrid}>
                            {contestStats.map(cs => (
                                <Link
                                    key={cs.contestId}
                                    to={`/contests/${cs.contestId}/scoreboard`}
                                    style={styles.contestStatCard}>
                                    <div style={styles.contestStatTop}>
                                        <div>
                                            <span style={styles.contestStatTitle}>
                                                {cs.title}
                                            </span>
                                            <div style={styles.contestStatDate}>
                                                {formatDate(cs.startTime)}
                                            </div>
                                        </div>
                                        <span style={{
                                            ...styles.contestStatStatus,
                                            color: cs.status === 'ONGOING'
                                                ? '#10b981'
                                                : cs.status === 'UPCOMING'
                                                    ? '#3b82f6' : '#6b7280',
                                            background: cs.status === 'ONGOING'
                                                ? 'rgba(16,185,129,0.1)'
                                                : cs.status === 'UPCOMING'
                                                    ? 'rgba(59,130,246,0.1)'
                                                    : 'rgba(107,114,128,0.1)',
                                        }}>
                                            {cs.status}
                                        </span>
                                    </div>
                                    <div style={styles.contestStatBody}>
                                        <div style={styles.contestScoreBlock}>
                                            <span style={styles.contestScoreValue}>
                                                {cs.score}
                                            </span>
                                            <span style={styles.contestScoreLabel}>
                                                points
                                            </span>
                                        </div>
                                        <div style={styles.contestSolvedBlock}>
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
                    <div style={styles.verdictCard}>
                        <h3 style={styles.sectionTitle}>
                            <BarChart2 size={16} />
                            Submission Breakdown
                        </h3>
                        <div style={styles.verdictGrid}>
                            {[
                                { label: 'Accepted', count: accepted, color: '#10b981' },
                                { label: 'Wrong Answer', count: wrongAnswer, color: '#ef4444' },
                                { label: 'TLE', count: tle, color: '#f59e0b' },
                                { label: 'Compile Error', count: ce, color: '#6366f1' },
                            ].map(item => (
                                <div key={item.label} style={styles.verdictItem}>
                                    <div style={styles.verdictItemTop}>
                                        <span style={{
                                            ...styles.verdictDot,
                                            background: item.color
                                        }} />
                                        <span style={styles.verdictItemLabel}>
                                            {item.label}
                                        </span>
                                        <span style={{
                                            ...styles.verdictItemCount,
                                            color: item.color
                                        }}>
                                            {item.count}
                                        </span>
                                    </div>
                                    <div style={styles.verdictBarBg}>
                                        <div style={{
                                            ...styles.verdictBar,
                                            width: total > 0
                                                ? `${(item.count / total) * 100}%`
                                                : '0%',
                                            background: item.color,
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ── Tabs (own profile only) ── */}
                {isOwnProfile && (
                    <>
                        <div style={styles.tabs}>
                            <button
                                onClick={() => setActiveTab('submissions')}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'submissions'
                                        ? styles.tabActive : {})
                                }}>
                                <Hash size={14} />
                                Submissions ({total})
                            </button>
                            <button
                                onClick={() => setActiveTab('solved')}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === 'solved'
                                        ? styles.tabActive : {})
                                }}>
                                <CheckCircle2 size={14} />
                                Solved Problems ({solvedProblems.length})
                            </button>
                        </div>

                        {/* Submissions Tab */}
                        {activeTab === 'submissions' && (
                            <div style={styles.tableCard}>
                                {submissions.length === 0 ? (
                                    <div style={styles.empty}>
                                        <Code2 size={48} color="#374151" />
                                        <p style={styles.emptyText}>
                                            No submissions yet
                                        </p>
                                        <Link to="/problems" style={styles.solveBtn}>
                                            Start Solving
                                        </Link>
                                    </div>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>#</th>
                                                <th style={styles.th}>Problem</th>
                                                <th style={styles.th}>Verdict</th>
                                                <th style={styles.th}>Language</th>
                                                <th style={styles.th}>Runtime</th>
                                                <th style={styles.th}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map((sub, i) => {
                                                const vs = getVerdictStyle(sub.verdict)
                                                const VIcon = vs.icon
                                                return (
                                                    <tr key={sub.id} style={styles.row}>
                                                        <td style={{
                                                            ...styles.td,
                                                            color: '#4b5563',
                                                            fontSize: '13px'
                                                        }}>
                                                            {i + 1}
                                                        </td>
                                                        <td style={styles.td}>
                                                            <Link
                                                                to={`/problems/${sub.problemId}`}
                                                                style={styles.problemLink}>
                                                                {sub.problemTitle}
                                                            </Link>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={{
                                                                ...styles.verdictBadge,
                                                                color: vs.color,
                                                                background: vs.bg,
                                                            }}>
                                                                <VIcon size={12} />
                                                                {formatVerdict(sub.verdict)}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={styles.langBadge}>
                                                                {sub.language}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={styles.runtime}>
                                                                {sub.runtimeMs
                                                                    ? `${sub.runtimeMs}ms` : '—'}
                                                            </span>
                                                        </td>
                                                        <td style={styles.td}>
                                                            <span style={styles.date}>
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
                            <div style={styles.tableCard}>
                                {solvedProblems.length === 0 ? (
                                    <div style={styles.empty}>
                                        <Trophy size={48} color="#374151" />
                                        <p style={styles.emptyText}>
                                            No solved problems yet
                                        </p>
                                        <Link to="/problems" style={styles.solveBtn}>
                                            Start Solving
                                        </Link>
                                    </div>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>#</th>
                                                <th style={styles.th}>Problem</th>
                                                <th style={styles.th}>Language</th>
                                                <th style={styles.th}>Runtime</th>
                                                <th style={styles.th}>Solved On</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {solvedProblems.map((sub, i) => (
                                                <tr key={sub.problemId} style={styles.row}>
                                                    <td style={{
                                                        ...styles.td,
                                                        color: '#4b5563',
                                                        fontSize: '13px'
                                                    }}>
                                                        {i + 1}
                                                    </td>
                                                    <td style={styles.td}>
                                                        <Link
                                                            to={`/problems/${sub.problemId}`}
                                                            style={styles.problemLink}>
                                                            {sub.problemTitle}
                                                        </Link>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={styles.langBadge}>
                                                            {sub.language}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <span style={styles.runtime}>
                                                            {sub.runtimeMs
                                                                ? `${sub.runtimeMs}ms` : '—'}
                                                        </span>
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.solvedOnCell}>
                                                            <CheckCircle2
                                                                size={14}
                                                                color="#10b981"
                                                            />
                                                            <span style={styles.date}>
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
                    <div style={styles.privateNote}>
                        <User size={20} color="#4b5563" />
                        <p style={{ color: '#6b7280', margin: 0 }}>
                            Detailed stats are private
                        </p>
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
        maxWidth: '960px',
        margin: '0 auto',
        padding: '0 24px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
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
        marginBottom: '24px',
        textDecoration: 'none',
        transition: 'color 0.15s',
    },

    contestStatDate: {
        fontSize: '11px',
        color: '#6b7280',
        marginTop: '2px',
    },

    // Hero Card
    heroCard: {
        position: 'relative',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '20px',
        overflow: 'hidden',
    },
    heroBg: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '80px',
        background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(99,102,241,0.1))',
        borderRadius: '20px 20px 0 0',
    },
    heroContent: {
        position: 'relative',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '20px',
        flexWrap: 'wrap',
    },
    avatarWrapper: {
        position: 'relative',
        flexShrink: 0,
    },
    avatarLarge: {
        width: '80px',
        height: '80px',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: '800',
        color: 'white',
        border: '3px solid #111827',
        boxShadow: '0 8px 24px rgba(59,130,246,0.3)',
    },
    adminDot: {
        position: 'absolute',
        bottom: '-2px',
        right: '-2px',
        width: '18px',
        height: '18px',
        background: '#818cf8',
        borderRadius: '50%',
        border: '2px solid #111827',
    },
    heroInfo: {
        flex: 1,
        minWidth: '200px',
    },
    heroNameRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
        marginBottom: '4px',
    },
    heroName: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.3px',
    },
    adminBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        background: 'rgba(99,102,241,0.15)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#818cf8',
    },
    youBadge: {
        padding: '3px 10px',
        background: 'rgba(59,130,246,0.15)',
        border: '1px solid rgba(59,130,246,0.3)',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#60a5fa',
    },
    heroEmail: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '10px',
    },
    heroMeta: {
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
    },
    metaChip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '20px',
        fontSize: '13px',
        color: '#9ca3af',
    },

    // Stats Grid
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
    },
    statCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        transition: 'border-color 0.2s',
    },
    statIcon: {
        width: '40px',
        height: '40px',
        background: '#0f172a',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: '32px',
        fontWeight: '800',
        color: '#3b82f6',
        letterSpacing: '-1px',
        lineHeight: 1,
    },
    statLabel: {
        fontSize: '13px',
        color: '#6b7280',
        fontWeight: '500',
    },

    // Verdict Breakdown
    verdictCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        padding: '20px 24px',
        marginBottom: '20px',
    },
    sectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '16px',
    },
    verdictGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
    },
    verdictItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    verdictItemTop: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
    },
    verdictDot: {
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        flexShrink: 0,
    },
    verdictItemLabel: {
        fontSize: '13px',
        color: '#9ca3af',
        flex: 1,
    },
    verdictItemCount: {
        fontSize: '14px',
        fontWeight: '700',
    },
    verdictBarBg: {
        height: '6px',
        background: '#1e2d45',
        borderRadius: '3px',
        overflow: 'hidden',
    },
    verdictBar: {
        height: '100%',
        borderRadius: '3px',
        transition: 'width 0.5s ease',
        minWidth: '4px',
    },

    // Tabs
    tabs: {
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid #1e2d45',
        marginBottom: '20px',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '12px 20px',
        background: 'none',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        color: '#6b7280',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
    },
    tabActive: {
        color: '#3b82f6',
        borderBottom: '2px solid #3b82f6',
    },

    // Table
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
    problemLink: {
        color: '#f9fafb',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'color 0.15s',
    },
    verdictBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: '600',
    },
    langBadge: {
        padding: '3px 10px',
        background: '#1a2235',
        border: '1px solid #1e2d45',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#9ca3af',
        fontFamily: "'JetBrains Mono', monospace",
    },
    runtime: {
        fontSize: '13px',
        color: '#6b7280',
        fontFamily: "'JetBrains Mono', monospace",
    },
    date: {
        fontSize: '13px',
        color: '#6b7280',
    },
    solvedOnCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '60px 20px',
    },
    emptyText: {
        fontSize: '16px',
        color: '#4b5563',
        fontWeight: '500',
    },
    solveBtn: {
        padding: '10px 24px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '600',
        textDecoration: 'none',
        marginTop: '8px',
        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
    },
    privateNote: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '24px',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '12px',
        justifyContent: 'center',
    },
    contestStatsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '14px',
    },
    contestStatCard: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '12px',
        textDecoration: 'none',
        transition: 'border-color 0.2s',
    },
    contestStatTop: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '8px',
    },
    contestStatTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#f9fafb',
    },
    contestStatStatus: {
        fontSize: '11px',
        fontWeight: '700',
        padding: '2px 8px',
        borderRadius: '20px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        whiteSpace: 'nowrap',
    },
    contestStatBody: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    contestScoreBlock: {
        display: 'flex',
        alignItems: 'baseline',
        gap: '5px',
    },
    contestScoreValue: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#f59e0b',
        letterSpacing: '-0.5px',
    },
    contestScoreLabel: {
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '500',
    },
    contestSolvedBlock: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '12px',
        color: '#9ca3af',
        fontWeight: '600',
    },
}