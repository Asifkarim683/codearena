import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminService } from '../services/adminService'
import { problemService } from '../services/problemService'
import { contestService } from '../services/contestService'
import toast from 'react-hot-toast'
import {
    Users, Code2, BarChart2, Shield,
    CheckCircle2, XCircle, Clock, AlertCircle,
    ChevronLeft, ChevronRight, Loader2,
    UserCheck, UserX, Crown, Plus, Trash2,
    LayoutDashboard, FileText, Settings,
    Trophy, X, Calendar
} from 'lucide-react'

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [submissions, setSubmissions] = useState([])
    const [problems, setProblems] = useState([])
    const [contests, setContests] = useState([])
    const [showContestModal, setShowContestModal] = useState(false)
    const [creatingContest, setCreatingContest] = useState(false)
    const [loading, setLoading] = useState(true)

    // New contest form fields
    const [contestTitle, setContestTitle] = useState('')
    const [contestDesc, setContestDesc] = useState('')
    const [contestStart, setContestStart] = useState('')
    const [contestEnd, setContestEnd] = useState('')
    const [selectedProblemIds, setSelectedProblemIds] = useState([])
    const [userPage, setUserPage] = useState(0)
    const [subPage, setSubPage] = useState(0)
    const [totalUserPages, setTotalUserPages] = useState(0)
    const [totalSubPages, setTotalSubPages] = useState(0)

    useEffect(() => {
        fetchStats()
    }, [])

    useEffect(() => {
        if (activeTab === 'users') fetchUsers()
    }, [activeTab, userPage])

    useEffect(() => {
        if (activeTab === 'submissions') fetchSubmissions()
    }, [activeTab, subPage])

    useEffect(() => {
        if (activeTab === 'problems') fetchProblems()
    }, [activeTab])

    useEffect(() => {
        if (activeTab === 'contests') {
            fetchContests()
            fetchProblems()
        }
    }, [activeTab])

    const fetchStats = async () => {
        setLoading(true)
        try {
            const res = await adminService.getStats()
            setStats(res.data)
        } catch (error) {
            toast.error('Failed to load stats')
        } finally {
            setLoading(false)
        }
    }

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await adminService.getUsers(userPage, 10)
            setUsers(res.data.content || [])
            setTotalUserPages(res.data.totalPages || 0)
        } catch (error) {
            toast.error('Failed to load users')
        } finally {
            setLoading(false)
        }
    }

    const fetchSubmissions = async () => {
        setLoading(true)
        try {
            const res = await adminService.getSubmissions(subPage, 10)
            setSubmissions(res.data.content || [])
            setTotalSubPages(res.data.totalPages || 0)
        } catch (error) {
            toast.error('Failed to load submissions')
        } finally {
            setLoading(false)
        }
    }

    const fetchProblems = async () => {
        setLoading(true)
        try {
            const res = await problemService.getProblems(0, 50)
            setProblems(res.data.content || [])
        } catch (error) {
            toast.error('Failed to load problems')
        } finally {
            setLoading(false)
        }
    }

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

    const toggleProblemSelection = (problemId) => {
        setSelectedProblemIds(prev =>
            prev.includes(problemId)
                ? prev.filter(id => id !== problemId)
                : [...prev, problemId]
        )
    }

    const resetContestForm = () => {
        setContestTitle('')
        setContestDesc('')
        setContestStart('')
        setContestEnd('')
        setSelectedProblemIds([])
    }

    const handleCreateContest = async () => {
        if (!contestTitle.trim()) {
            toast.error('Contest title is required')
            return
        }
        if (!contestDesc.trim()) {
            toast.error('Description is required')
            return
        }
        if (!contestStart || !contestEnd) {
            toast.error('Start and end time are required')
            return
        }
        if (new Date(contestEnd) <= new Date(contestStart)) {
            toast.error('End time must be after start time')
            return
        }
        if (selectedProblemIds.length === 0) {
            toast.error('Select at least one problem')
            return
        }

        setCreatingContest(true)
        try {
            await contestService.createContest({
                title: contestTitle.trim(),
                description: contestDesc.trim(),
                startTime: contestStart,
                endTime: contestEnd,
                problemIds: selectedProblemIds,
            })
            toast.success('Contest created successfully!')
            setShowContestModal(false)
            resetContestForm()
            fetchContests()
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to create contest')
        } finally {
            setCreatingContest(false)
        }
    }

    const handleDeleteContest = async (id) => {
        try {
            await contestService.deleteContest(id)
            toast.success('Contest deleted')
            fetchContests()
        } catch (error) {
            toast.error('Failed to delete contest')
        }
    }

    const handleDeactivate = async (id) => {
        try {
            await adminService.deactivateUser(id)
            toast.success('User deactivated')
            fetchUsers()
        } catch (error) {
            toast.error('Failed to deactivate user')
        }
    }

    const handleActivate = async (id) => {
        try {
            await adminService.activateUser(id)
            toast.success('User activated')
            fetchUsers()
        } catch (error) {
            toast.error('Failed to activate user')
        }
    }

    const handlePromote = async (id) => {
        try {
            await adminService.promoteUser(id)
            toast.success('User promoted to Admin')
            fetchUsers()
        } catch (error) {
            toast.error('Failed to promote user')
        }
    }

    const handleDeleteProblem = async (id) => {
        try {
            await problemService.deleteProblem(id)
            toast.success('Problem deleted')
            fetchProblems()
        } catch (error) {
            toast.error('Failed to delete problem')
        }
    }

    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'ACCEPTED':
                return { color: '#10b981', bg: '#10b98118' }
            case 'WRONG_ANSWER':
                return { color: '#ef4444', bg: '#ef444418' }
            case 'TIME_LIMIT_EXCEEDED':
                return { color: '#f59e0b', bg: '#f59e0b18' }
            case 'COMPILATION_ERROR':
                return { color: '#6366f1', bg: '#6366f118' }
            default:
                return { color: '#6b7280', bg: '#6b728018' }
        }
    }

    const getDiffStyle = (diff) => {
        switch (diff) {
            case 'EASY': return { color: '#10b981', bg: '#10b98118' }
            case 'MEDIUM': return { color: '#f59e0b', bg: '#f59e0b18' }
            case 'HARD': return { color: '#ef4444', bg: '#ef444418' }
            default: return {}
        }
    }

    const formatDate = (d) => new Date(d).toLocaleDateString(
        'en-IN', { year: 'numeric', month: 'short', day: 'numeric' })

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'problems', label: 'Problems', icon: Code2 },
        { id: 'contests', label: 'Contests', icon: Trophy },
        { id: 'submissions', label: 'Submissions', icon: FileText },
    ]

    return (
        <div style={styles.page}>

            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.sidebarHeader}>
                    <Shield size={20} color="#818cf8" />
                    <span style={styles.sidebarTitle}>Admin Panel</span>
                </div>
                <nav style={styles.sidebarNav}>
                    {sidebarItems.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            style={{
                                ...styles.sidebarItem,
                                ...(activeTab === id ? styles.sidebarItemActive : {})
                            }}>
                            <Icon size={18} />
                            {label}
                        </button>
                    ))}
                </nav>
                <div style={styles.sidebarFooter}>
                    <Link to="/problems" style={styles.backLink}>
                        <ChevronLeft size={16} />
                        Back to Site
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.main}>

                {/* ── DASHBOARD ── */}
                {activeTab === 'dashboard' && (
                    <div style={styles.content}>
                        <h1 style={styles.pageTitle}>Dashboard</h1>
                        <p style={styles.pageSubtitle}>
                            Platform overview and statistics
                        </p>

                        {loading ? (
                            <div style={styles.loadingDiv}>
                                <Loader2 size={32} color="#3b82f6"
                                    style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (
                            <>
                                {/* Stats Cards */}
                                <div style={styles.statsGrid}>
                                    {[
                                        {
                                            label: 'Total Users',
                                            value: stats?.totalUsers || 0,
                                            icon: Users,
                                            color: '#3b82f6',
                                            bg: 'rgba(59,130,246,0.1)'
                                        },
                                        {
                                            label: 'Total Problems',
                                            value: stats?.totalProblems || 0,
                                            icon: Code2,
                                            color: '#10b981',
                                            bg: 'rgba(16,185,129,0.1)'
                                        },
                                        {
                                            label: 'Total Submissions',
                                            value: stats?.totalSubmissions || 0,
                                            icon: BarChart2,
                                            color: '#f59e0b',
                                            bg: 'rgba(245,158,11,0.1)'
                                        },
                                        {
                                            label: 'Active Problems',
                                            value: stats?.activeProblems || 0,
                                            icon: CheckCircle2,
                                            color: '#6366f1',
                                            bg: 'rgba(99,102,241,0.1)'
                                        },
                                    ].map(({ label, value, icon: Icon, color, bg }) => (
                                        <div key={label} style={styles.statCard}>
                                            <div style={{
                                                ...styles.statIconBox,
                                                background: bg
                                            }}>
                                                <Icon size={22} color={color} />
                                            </div>
                                            <div style={{
                                                ...styles.statValue, color
                                            }}>
                                                {value}
                                            </div>
                                            <div style={styles.statLabel}>{label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <div style={styles.quickActionsCard}>
                                    <h3 style={styles.cardTitle}>Quick Actions</h3>
                                    <div style={styles.quickActions}>
                                        <button
                                            onClick={() => setActiveTab('users')}
                                            style={styles.quickBtn}>
                                            <Users size={16} />
                                            Manage Users
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('problems')}
                                            style={styles.quickBtn}>
                                            <Code2 size={16} />
                                            Manage Problems
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('submissions')}
                                            style={styles.quickBtn}>
                                            <FileText size={16} />
                                            View Submissions
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* ── USERS ── */}
                {activeTab === 'users' && (
                    <div style={styles.content}>
                        <h1 style={styles.pageTitle}>Users</h1>
                        <p style={styles.pageSubtitle}>
                            Manage all registered users
                        </p>

                        <div style={styles.tableCard}>
                            {loading ? (
                                <div style={styles.loadingDiv}>
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                </div>
                            ) : (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>User</th>
                                            <th style={styles.th}>Email</th>
                                            <th style={styles.th}>Role</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Joined</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} style={styles.row}>
                                                <td style={styles.td}>
                                                    <div style={styles.userCell}>
                                                        <div style={styles.miniAvatar}>
                                                            {user.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span style={styles.username}>
                                                            {user.username}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.email}>
                                                        {user.email}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.roleBadge,
                                                        ...(user.role === 'ADMIN'
                                                            ? styles.adminRole
                                                            : styles.userRole)
                                                    }}>
                                                        {user.role === 'ADMIN'
                                                            ? <Crown size={11} />
                                                            : <Users size={11} />}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        ...(user.isActive
                                                            ? styles.activeStatus
                                                            : styles.inactiveStatus)
                                                    }}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.date}>
                                                        {formatDate(user.createdAt)}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={styles.actions}>
                                                        {user.isActive ? (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeactivate(user.id)}
                                                                style={styles.dangerBtn}
                                                                title="Deactivate">
                                                                <UserX size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleActivate(user.id)}
                                                                style={styles.successBtn}
                                                                title="Activate">
                                                                <UserCheck size={14} />
                                                            </button>
                                                        )}
                                                        {user.role !== 'ADMIN' && (
                                                            <button
                                                                onClick={() =>
                                                                    handlePromote(user.id)}
                                                                style={styles.promoteBtn}
                                                                title="Promote to Admin">
                                                                <Crown size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>

                        {/* Pagination */}
                        <div style={styles.pagination}>
                            <button
                                onClick={() =>
                                    setUserPage(p => Math.max(0, p - 1))}
                                disabled={userPage === 0}
                                style={{
                                    ...styles.pageBtn,
                                    opacity: userPage === 0 ? 0.4 : 1
                                }}>
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <span style={styles.pageInfo}>
                                Page {userPage + 1} of {totalUserPages}
                            </span>
                            <button
                                onClick={() =>
                                    setUserPage(p =>
                                        Math.min(totalUserPages - 1, p + 1))}
                                disabled={userPage === totalUserPages - 1}
                                style={{
                                    ...styles.pageBtn,
                                    opacity: userPage === totalUserPages - 1
                                        ? 0.4 : 1
                                }}>
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── PROBLEMS ── */}
                {activeTab === 'problems' && (
                    <div style={styles.content}>
                        <div style={styles.contentHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Problems</h1>
                                <p style={styles.pageSubtitle}>
                                    Manage all coding problems
                                </p>
                            </div>
                            <Link
                                to="/admin/problems/create"
                                style={styles.createBtn}>
                                <Plus size={16} />
                                Create Problem
                            </Link>
                        </div>

                        <div style={styles.tableCard}>
                            {loading ? (
                                <div style={styles.loadingDiv}>
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                </div>
                            ) : problems.length === 0 ? (
                                <div style={styles.empty}>
                                    <Code2 size={48} color="#374151" />
                                    <p style={styles.emptyText}>
                                        No problems yet
                                    </p>
                                </div>
                            ) : (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>#</th>
                                            <th style={styles.th}>Title</th>
                                            <th style={styles.th}>Difficulty</th>
                                            <th style={styles.th}>Tags</th>
                                            <th style={styles.th}>Submissions</th>
                                            <th style={styles.th}>Acceptance</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {problems.map((p, i) => (
                                            <tr key={p.id} style={styles.row}>
                                                <td style={{
                                                    ...styles.td, color: '#4b5563'
                                                }}>
                                                    {i + 1}
                                                </td>
                                                <td style={styles.td}>
                                                    <Link
                                                        to={`/problems/${p.id}`}
                                                        style={styles.problemLink}>
                                                        {p.title}
                                                    </Link>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.diffBadge,
                                                        color: getDiffStyle(p.difficulty).color,
                                                        background: getDiffStyle(
                                                            p.difficulty).bg,
                                                    }}>
                                                        {p.difficulty}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={styles.tags}>
                                                        {p.tags?.slice(0, 2).map(tag => (
                                                            <span key={tag} style={styles.tag}>
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {p.tags?.length > 2 && (
                                                            <span style={styles.moreTag}>
                                                                +{p.tags.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.date}>
                                                        {p.totalSubmissions}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        color: p.acceptanceRate >= 50
                                                            ? '#10b981' : '#f59e0b',
                                                        fontWeight: '600',
                                                        fontSize: '13px'
                                                    }}>
                                                        {p.acceptanceRate?.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={styles.actions}>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteProblem(p.id)}
                                                            style={styles.dangerBtn}
                                                            title="Delete problem">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ── CONTESTS ── */}
                {activeTab === 'contests' && (
                    <div style={styles.content}>
                        <div style={styles.contentHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Contests</h1>
                                <p style={styles.pageSubtitle}>
                                    Manage coding contests
                                </p>
                            </div>
                            <button
                                onClick={() => setShowContestModal(true)}
                                style={styles.createBtn}>
                                <Plus size={16} />
                                Create Contest
                            </button>
                        </div>

                        <div style={styles.tableCard}>
                            {loading ? (
                                <div style={styles.loadingDiv}>
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                </div>
                            ) : contests.length === 0 ? (
                                <div style={styles.empty}>
                                    <Trophy size={48} color="#374151" />
                                    <p style={styles.emptyText}>
                                        No contests yet
                                    </p>
                                </div>
                            ) : (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>Title</th>
                                            <th style={styles.th}>Status</th>
                                            <th style={styles.th}>Start Time</th>
                                            <th style={styles.th}>End Time</th>
                                            <th style={styles.th}>Problems</th>
                                            <th style={styles.th}>Participants</th>
                                            <th style={styles.th}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contests.map(contest => (
                                            <tr key={contest.id} style={styles.row}>
                                                <td style={styles.td}>
                                                    <Link
                                                        to={`/contests/${contest.id}`}
                                                        style={styles.problemLink}>
                                                        {contest.title}
                                                    </Link>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.statusBadge,
                                                        ...(contest.status === 'ONGOING'
                                                            ? { color: '#10b981', background: 'rgba(16,185,129,0.1)' }
                                                            : contest.status === 'UPCOMING'
                                                                ? { color: '#3b82f6', background: 'rgba(59,130,246,0.1)' }
                                                                : { color: '#6b7280', background: 'rgba(107,114,128,0.1)' })
                                                    }}>
                                                        {contest.status}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.date}>
                                                        {formatDate(contest.startTime)}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.date}>
                                                        {formatDate(contest.endTime)}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.date}>
                                                        {contest.totalProblems}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={styles.date}>
                                                        {contest.totalParticipants}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <div style={styles.actions}>
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteContest(contest.id)}
                                                            style={styles.dangerBtn}
                                                            title="Delete contest">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ── SUBMISSIONS ── */}
                {activeTab === 'submissions' && (
                    <div style={styles.content}>
                        <h1 style={styles.pageTitle}>All Submissions</h1>
                        <p style={styles.pageSubtitle}>
                            View all code submissions across the platform
                        </p>

                        <div style={styles.tableCard}>
                            {loading ? (
                                <div style={styles.loadingDiv}>
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                </div>
                            ) : (
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.th}>#</th>
                                            <th style={styles.th}>User</th>
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
                                            return (
                                                <tr key={sub.id} style={styles.row}>
                                                    <td style={{
                                                        ...styles.td, color: '#4b5563'
                                                    }}>
                                                        {subPage * 10 + i + 1}
                                                    </td>
                                                    <td style={styles.td}>
                                                        <div style={styles.userCell}>
                                                            <div style={styles.miniAvatar}>
                                                                {sub.username?.charAt(0)
                                                                    .toUpperCase()}
                                                            </div>
                                                            <span style={styles.username}>
                                                                {sub.username}
                                                            </span>
                                                        </div>
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
                                                            {sub.verdict?.replace(/_/g, ' ')}
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

                        {/* Pagination */}
                        <div style={styles.pagination}>
                            <button
                                onClick={() =>
                                    setSubPage(p => Math.max(0, p - 1))}
                                disabled={subPage === 0}
                                style={{
                                    ...styles.pageBtn,
                                    opacity: subPage === 0 ? 0.4 : 1
                                }}>
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <span style={styles.pageInfo}>
                                Page {subPage + 1} of {totalSubPages}
                            </span>
                            <button
                                onClick={() =>
                                    setSubPage(p =>
                                        Math.min(totalSubPages - 1, p + 1))}
                                disabled={subPage >= totalSubPages - 1}
                                style={{
                                    ...styles.pageBtn,
                                    opacity: subPage >= totalSubPages - 1
                                        ? 0.4 : 1
                                }}>
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── CREATE CONTEST MODAL ── */}
            {showContestModal && (
                <div style={styles.modalOverlay}
                    onClick={() => setShowContestModal(false)}>
                    <div style={styles.modal}
                        onClick={(e) => e.stopPropagation()}>

                        <div style={styles.modalHeader}>
                            <h2 style={styles.modalTitle}>
                                <Trophy size={18} color="#f59e0b" />
                                Create New Contest
                            </h2>
                            <button
                                onClick={() => setShowContestModal(false)}
                                style={styles.modalCloseBtn}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={styles.modalBody}>

                            {/* Title */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Contest Title <span style={styles.required}>*</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Weekly Contest 5"
                                    value={contestTitle}
                                    onChange={(e) => setContestTitle(e.target.value)}
                                    style={styles.input}
                                />
                            </div>

                            {/* Description */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Description <span style={styles.required}>*</span>
                                </label>
                                <textarea
                                    placeholder="Brief description of the contest..."
                                    value={contestDesc}
                                    onChange={(e) => setContestDesc(e.target.value)}
                                    style={{ ...styles.textarea, minHeight: '80px' }}
                                />
                            </div>

                            {/* Time Range */}
                            <div style={styles.timeGrid}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        Start Time <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={contestStart}
                                        onChange={(e) => setContestStart(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>
                                        End Time <span style={styles.required}>*</span>
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={contestEnd}
                                        onChange={(e) => setContestEnd(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>

                            {/* Problem Selection */}
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Select Problems <span style={styles.required}>*</span>
                                </label>
                                <p style={styles.hint}>
                                    {selectedProblemIds.length} problem(s) selected
                                </p>
                                <div style={styles.problemSelectList}>
                                    {problems.length === 0 ? (
                                        <p style={{
                                            color: '#6b7280',
                                            fontSize: '13px',
                                            padding: '12px'
                                        }}>
                                            No problems available. Create a problem first.
                                        </p>
                                    ) : (
                                        problems.map(p => (
                                            <label
                                                key={p.id}
                                                style={{
                                                    ...styles.problemCheckRow,
                                                    ...(selectedProblemIds.includes(p.id)
                                                        ? styles.problemCheckRowActive : {})
                                                }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProblemIds.includes(p.id)}
                                                    onChange={() =>
                                                        toggleProblemSelection(p.id)}
                                                    style={{ marginRight: '10px' }}
                                                />
                                                <span style={styles.problemCheckTitle}>
                                                    {p.title}
                                                </span>
                                                <span style={{
                                                    ...styles.diffBadge,
                                                    color: getDiffStyle(p.difficulty).color,
                                                    background: getDiffStyle(p.difficulty).bg,
                                                }}>
                                                    {p.difficulty}
                                                </span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        <div style={styles.modalFooter}>
                            <button
                                onClick={() => {
                                    setShowContestModal(false)
                                    resetContestForm()
                                }}
                                style={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateContest}
                                disabled={creatingContest}
                                style={{
                                    ...styles.confirmBtn,
                                    opacity: creatingContest ? 0.7 : 1
                                }}>
                                <Trophy size={15} />
                                {creatingContest
                                    ? 'Creating...' : 'Create Contest'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = {
    page: {
        display: 'flex',
        minHeight: 'calc(100vh - 64px)',
        background: '#0a0e1a',
    },

    // Sidebar
    sidebar: {
        width: '240px',
        background: '#111827',
        borderRight: '1px solid #1e2d45',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'sticky',
        top: '64px',
        height: 'calc(100vh - 64px)',
    },
    sidebarHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '20px 20px 16px',
        borderBottom: '1px solid #1e2d45',
    },
    sidebarTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#f9fafb',
    },
    sidebarNav: {
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        gap: '4px',
        flex: 1,
    },
    sidebarItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#9ca3af',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
        textAlign: 'left',
    },
    sidebarItemActive: {
        color: '#f9fafb',
        background: 'rgba(59, 130, 246, 0.12)',
    },
    sidebarFooter: {
        padding: '16px',
        borderTop: '1px solid #1e2d45',
    },
    backLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#6b7280',
        textDecoration: 'none',
    },

    // Main
    main: {
        flex: 1,
        overflow: 'auto',
    },
    content: {
        padding: '32px',
        maxWidth: '1100px',
    },
    contentHeader: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '4px',
    },
    pageTitle: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.3px',
        marginBottom: '4px',
    },
    pageSubtitle: {
        fontSize: '14px',
        color: '#6b7280',
        marginBottom: '28px',
    },
    loadingDiv: {
        display: 'flex',
        justifyContent: 'center',
        padding: '60px',
    },

    createBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
    },

    // Stats
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
    },
    statCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    statIconBox: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: '32px',
        fontWeight: '800',
        letterSpacing: '-1px',
        lineHeight: 1,
    },
    statLabel: {
        fontSize: '13px',
        color: '#6b7280',
        fontWeight: '500',
    },

    // Quick Actions
    quickActionsCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        padding: '24px',
    },
    cardTitle: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: '16px',
    },
    quickActions: {
        display: 'flex',
        gap: '12px',
        flexWrap: 'wrap',
    },
    quickBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 20px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        color: '#9ca3af',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
    },

    // Table
    tableCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '20px',
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
    userCell: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    miniAvatar: {
        width: '30px',
        height: '30px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: '700',
        color: 'white',
        flexShrink: 0,
    },
    username: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f9fafb',
    },
    email: {
        fontSize: '13px',
        color: '#6b7280',
    },
    roleBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    adminRole: {
        color: '#818cf8',
        background: 'rgba(99,102,241,0.1)',
        border: '1px solid rgba(99,102,241,0.2)',
    },
    userRole: {
        color: '#9ca3af',
        background: 'rgba(107,114,128,0.1)',
        border: '1px solid rgba(107,114,128,0.2)',
    },
    statusBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    activeStatus: {
        color: '#10b981',
        background: 'rgba(16,185,129,0.1)',
    },
    inactiveStatus: {
        color: '#ef4444',
        background: 'rgba(239,68,68,0.1)',
    },
    actions: {
        display: 'flex',
        gap: '8px',
    },
    dangerBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '8px',
        color: '#ef4444',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    successBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '8px',
        color: '#10b981',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    promoteBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: '8px',
        color: '#f59e0b',
        cursor: 'pointer',
        transition: 'all 0.15s',
    },
    problemLink: {
        color: '#f9fafb',
        fontWeight: '500',
        textDecoration: 'none',
    },
    diffBadge: {
        display: 'inline-flex',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    tags: {
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
    },
    tag: {
        padding: '3px 8px',
        background: '#1a2235',
        border: '1px solid #1e2d45',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#9ca3af',
    },
    moreTag: {
        padding: '3px 8px',
        background: '#1a2235',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#6b7280',
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
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '20px',
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
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    pageInfo: {
        fontSize: '14px',
        color: '#6b7280',
    },
    // Contest Modal
    modalOverlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modal: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
    },
    modalHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid #1e2d45',
    },
    modalTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '16px',
        fontWeight: '700',
        color: '#f9fafb',
    },
    modalCloseBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#9ca3af',
        cursor: 'pointer',
    },
    modalBody: {
        padding: '20px 24px',
        overflowY: 'auto',
        flex: 1,
    },
    modalFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        padding: '16px 24px',
        borderTop: '1px solid #1e2d45',
    },
    timeGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
    },
    problemSelectList: {
        maxHeight: '220px',
        overflowY: 'auto',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        background: '#0f172a',
    },
    problemCheckRow: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 14px',
        borderBottom: '1px solid #1e2d45',
        cursor: 'pointer',
        transition: 'background 0.15s',
    },
    problemCheckRowActive: {
        background: 'rgba(59,130,246,0.08)',
    },
    problemCheckTitle: {
        flex: 1,
        fontSize: '13px',
        color: '#f9fafb',
        fontWeight: '500',
    },
    cancelBtn: {
        padding: '10px 20px',
        background: 'transparent',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        color: '#9ca3af',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    confirmBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 4px 12px rgba(245,158,11,0.3)',
    },
    formGroup: {
        marginBottom: '18px',
    },
    label: {
        display: 'block',
        fontSize: '12px',
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px',
    },
    required: {
        color: '#ef4444',
    },
    hint: {
        fontSize: '12px',
        color: '#4b5563',
        marginBottom: '8px',
    },
    input: {
        width: '100%',
        padding: '10px 14px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#f9fafb',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px 14px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#f9fafb',
        fontSize: '14px',
        fontFamily: 'inherit',
        resize: 'vertical',
        boxSizing: 'border-box',
    },
}