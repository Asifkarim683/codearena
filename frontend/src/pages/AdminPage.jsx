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
    Trophy, X, Calendar, MessageSquare
} from 'lucide-react'
<<<<<<< HEAD
import { supportService } from '../services/supportService'
=======
import './AdminPage.css'
>>>>>>> 0986170 (complete overhaul of ui)

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

    const [tickets, setTickets] = useState([])
    const [ticketPage, setTicketPage] = useState(0)
    const [totalTicketPages, setTotalTicketPages] = useState(0)
    const [ticketFilter, setTicketFilter] = useState('ALL')
    const [openTicketCount, setOpenTicketCount] = useState(0)

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
                return { color: '#10b981', bg: 'rgba(16,185,129,0.08)' }
            case 'WRONG_ANSWER':
                return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)' }
            case 'TIME_LIMIT_EXCEEDED':
                return { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' }
            case 'COMPILATION_ERROR':
                return { color: '#6366f1', bg: 'rgba(99,102,241,0.08)' }
            default:
                return { color: '#64748b', bg: 'rgba(100,116,139,0.08)' }
        }
    }

    const getDiffStyle = (diff) => {
        switch (diff) {
            case 'EASY': return { color: '#10b981', bg: 'rgba(16,185,129,0.08)' }
            case 'MEDIUM': return { color: '#d97706', bg: 'rgba(245,158,11,0.08)' }
            case 'HARD': return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)' }
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
        { id: 'support', label: 'Support', icon: MessageSquare, badge: openTicketCount },
    ]

    useEffect(() => {
        if (activeTab === 'support') fetchTickets()
    }, [activeTab, ticketPage, ticketFilter])

    useEffect(() => {
        fetchOpenTicketCount()
    }, [])

    const fetchOpenTicketCount = async () => {
        try {
            const res = await supportService.getOpenCount()
            setOpenTicketCount(res.data || 0)
        } catch (error) { }
    }

    const fetchTickets = async () => {
        setLoading(true)
        try {
            const res = await supportService.getAllTickets(
                ticketPage, 10, ticketFilter)
            setTickets(res.data.content || [])
            setTotalTicketPages(res.data.totalPages || 0)
        } catch (error) {
            toast.error('Failed to load tickets')
        } finally {
            setLoading(false)
        }
    }

    const handleResolveTicket = async (id) => {
        try {
            await supportService.resolveTicket(id)
            toast.success('Ticket resolved')
            fetchTickets()
            fetchOpenTicketCount()
        } catch (error) {
            toast.error('Failed to resolve ticket')
        }
    }

    return (
        <div className="admin-page">

            {/* Sidebar */}
            <div className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <Shield size={20} color="#3b82f6" />
                    <span className="admin-sidebar-title">Admin Panel</span>
                </div>
<<<<<<< HEAD
                <nav style={styles.sidebarNav}>
                    {sidebarItems.map(({ id, label, icon: Icon, badge }) => (
=======
                <nav className="admin-sidebar-nav">
                    {sidebarItems.map(({ id, label, icon: Icon }) => (
>>>>>>> 0986170 (complete overhaul of ui)
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`admin-sidebar-item${activeTab === id ? ' admin-sidebar-item-active' : ''}`}>
                            <Icon size={18} />
                            {label}
                            {badge > 0 && (
                                <span style={styles.sidebarBadge}>{badge}</span>
                            )}
                        </button>
                    ))}
                </nav>
                <div className="admin-sidebar-footer">
                    <Link to="/problems" className="admin-back-link">
                        <ChevronLeft size={16} />
                        Back to Site
                    </Link>
                </div>
            </div>

            {/* Main Content */}
            <div className="admin-main">
                {/* Decorative Blobs */}
                <div className="blob blob-pink" />
                <div className="blob blob-mint" />

                {/* ── DASHBOARD ── */}
                {activeTab === 'dashboard' && (
                    <div className="admin-content">
                        <h1 className="admin-page-title">Dashboard</h1>
                        <p className="admin-page-subtitle">
                            Platform overview and statistics
                        </p>

                        {loading ? (
                            <div className="admin-loading-div">
                                <Loader2 size={32} color="#3b82f6"
                                    style={{ animation: 'spin 1s linear infinite' }} />
                            </div>
                        ) : (
                            <>
                                {/* Stats Cards */}
                                <div className="admin-stats-grid">
                                    {[
                                        {
                                            label: 'Total Users',
                                            value: stats?.totalUsers || 0,
                                            icon: Users,
                                            color: '#3b82f6',
                                            bg: 'rgba(59,130,246,0.08)'
                                        },
                                        {
                                            label: 'Total Problems',
                                            value: stats?.totalProblems || 0,
                                            icon: Code2,
                                            color: '#10b981',
                                            bg: 'rgba(16,185,129,0.08)'
                                        },
                                        {
                                            label: 'Total Submissions',
                                            value: stats?.totalSubmissions || 0,
                                            icon: BarChart2,
                                            color: '#6366f1',
                                            bg: 'rgba(99,102,241,0.08)'
                                        },
                                        {
                                            label: 'Active Problems',
                                            value: stats?.activeProblems || 0,
                                            icon: CheckCircle2,
                                            color: '#d97706',
                                            bg: 'rgba(245,158,11,0.08)'
                                        },
                                    ].map(({ label, value, icon: Icon, color, bg }) => (
                                        <div key={label} className="admin-stat-card">
                                            <div 
                                                className="admin-stat-icon-box"
                                                style={{ background: bg }}
                                            >
                                                <Icon size={22} color={color} />
                                            </div>
                                            <div 
                                                className="admin-stat-value"
                                                style={{ color }}
                                            >
                                                {value}
                                            </div>
                                            <div className="admin-stat-label">{label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Quick Actions */}
                                <div className="admin-quick-actions-card">
                                    <h3 className="admin-card-title">Quick Actions</h3>
                                    <div className="admin-quick-actions">
                                        <button
                                            onClick={() => setActiveTab('users')}
                                            className="admin-quick-btn">
                                            <Users size={16} style={{ color: '#3b82f6' }} />
                                            Manage Users
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('problems')}
                                            className="admin-quick-btn">
                                            <Code2 size={16} style={{ color: '#10b981' }} />
                                            Manage Problems
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('submissions')}
                                            className="admin-quick-btn">
                                            <FileText size={16} style={{ color: '#6366f1' }} />
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
                    <div className="admin-content">
                        <h1 className="admin-page-title">Users</h1>
                        <p className="admin-page-subtitle">
                            Manage all registered users
                        </p>

                        <div className="admin-table-card">
                            {loading ? (
                                <div className="admin-loading-div">
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th className="admin-th">User</th>
                                            <th className="admin-th">Email</th>
                                            <th className="admin-th">Role</th>
                                            <th className="admin-th">Status</th>
                                            <th className="admin-th">Joined</th>
                                            <th className="admin-th">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {users.map(user => (
                                            <tr key={user.id} className="admin-row">
                                                <td className="admin-td">
                                                    <div className="admin-user-cell">
                                                        <div className="admin-mini-avatar">
                                                            {user.username?.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="admin-username">
                                                            {user.username}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="admin-td">
                                                    <span className="admin-email">
                                                        {user.email}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <span className={`admin-role-badge ${user.role === 'ADMIN' ? 'admin-admin-role' : 'admin-user-role'}`}>
                                                        {user.role === 'ADMIN'
                                                            ? <Crown size={11} style={{ marginRight: '4px' }} />
                                                            : <Users size={11} style={{ marginRight: '4px' }} />}
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <span className={`admin-status-badge ${user.isActive ? 'admin-active-status' : 'admin-inactive-status'}`}>
                                                        {user.isActive ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <span className="admin-date">
                                                        {formatDate(user.createdAt)}
                                                    </span>
                                                </td>
<<<<<<< HEAD
                                                <td style={styles.td}>
                                                    <div style={styles.actions}>
                                                        {user.role === 'ADMIN' ? (
                                                            <span style={styles.protectedLabel}>
                                                                Protected
                                                            </span>
                                                        ) : user.isActive ? (
=======
                                                <td className="admin-td">
                                                    <div className="admin-actions">
                                                        {user.isActive ? (
>>>>>>> 0986170 (complete overhaul of ui)
                                                            <button
                                                                onClick={() =>
                                                                    handleDeactivate(user.id)}
                                                                className="admin-danger-btn"
                                                                title="Deactivate">
                                                                <UserX size={14} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    handleActivate(user.id)}
                                                                className="admin-success-btn"
                                                                title="Activate">
                                                                <UserCheck size={14} />
                                                            </button>
                                                        )}
                                                        {user.role !== 'ADMIN' && (
                                                            <button
                                                                onClick={() =>
                                                                    handlePromote(user.id)}
                                                                className="admin-promote-btn"
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
                        <div className="admin-pagination">
                            <button
                                onClick={() =>
                                    setUserPage(p => Math.max(0, p - 1))}
                                disabled={userPage === 0}
                                className="admin-page-btn"
                                style={{ opacity: userPage === 0 ? 0.4 : 1 }}>
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <span className="admin-page-info">
                                Page {userPage + 1} of {totalUserPages}
                            </span>
                            <button
                                onClick={() =>
                                    setUserPage(p =>
                                        Math.min(totalUserPages - 1, p + 1))}
                                disabled={userPage === totalUserPages - 1}
                                className="admin-page-btn"
                                style={{ opacity: userPage === totalUserPages - 1 ? 0.4 : 1 }}>
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── PROBLEMS ── */}
                {activeTab === 'problems' && (
                    <div className="admin-content">
                        <div className="admin-page-header">
                            <div>
                                <h1 className="admin-page-title">Problems</h1>
                                <p className="admin-page-subtitle">
                                    Manage all coding problems
                                </p>
                            </div>
                            <Link
                                to="/admin/problems/create"
                                className="admin-create-btn">
                                <Plus size={16} />
                                Create Problem
                            </Link>
                        </div>

                        <div className="admin-table-card">
                            {loading ? (
                                <div className="admin-loading-div">
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                </div>
                            ) : problems.length === 0 ? (
                                <div className="admin-empty">
                                    <Code2 size={48} color="#94a3b8" />
                                    <p className="admin-empty-text">
                                        No problems yet
                                    </p>
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th className="admin-th">#</th>
                                            <th className="admin-th">Title</th>
                                            <th className="admin-th">Difficulty</th>
                                            <th className="admin-th">Tags</th>
                                            <th className="admin-th">Submissions</th>
                                            <th className="admin-th">Acceptance</th>
                                            <th className="admin-th">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {problems.map((p, i) => (
                                            <tr key={p.id} className="admin-row">
                                                <td className="admin-td" style={{ color: '#94a3b8', fontWeight: '600' }}>
                                                    {i + 1}
                                                </td>
                                                <td className="admin-td">
                                                    <Link
                                                        to={`/problems/${p.id}`}
                                                        className="admin-problem-link">
                                                        {p.title}
                                                    </Link>
                                                </td>
                                                <td className="admin-td">
                                                    <span 
                                                        className="admin-diff-badge"
                                                        style={{
                                                            color: getDiffStyle(p.difficulty).color,
                                                            background: getDiffStyle(p.difficulty).bg,
                                                        }}
                                                    >
                                                        {p.difficulty}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <div className="admin-tags">
                                                        {p.tags?.slice(0, 2).map(tag => (
                                                            <span key={tag} className="admin-tag">
                                                                {tag}
                                                            </span>
                                                        ))}
                                                        {p.tags?.length > 2 && (
                                                            <span className="admin-more-tag">
                                                                +{p.tags.length - 2}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="admin-td">
                                                    <span className="admin-date">
                                                        {p.totalSubmissions}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <span style={{
                                                        color: p.acceptanceRate >= 50
                                                            ? '#10b981' : '#d97706',
                                                        fontWeight: '700',
                                                        fontSize: '13.5px'
                                                    }}>
                                                        {p.acceptanceRate?.toFixed(1)}%
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <div className="admin-actions">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteProblem(p.id)}
                                                            className="admin-danger-btn"
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
                    <div className="admin-content">
                        <div className="admin-page-header">
                            <div>
                                <h1 className="admin-page-title">Contests</h1>
                                <p className="admin-page-subtitle">
                                    Manage coding contests
                                </p>
                            </div>
                            <button
                                onClick={() => setShowContestModal(true)}
                                className="admin-create-btn">
                                <Plus size={16} />
                                Create Contest
                            </button>
                        </div>

                        <div className="admin-table-card">
                            {loading ? (
                                <div className="admin-loading-div">
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                </div>
                            ) : contests.length === 0 ? (
                                <div className="admin-empty">
                                    <Trophy size={48} color="#94a3b8" />
                                    <p className="admin-empty-text">
                                        No contests yet
                                    </p>
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th className="admin-th">Title</th>
                                            <th className="admin-th">Status</th>
                                            <th className="admin-th">Start Time</th>
                                            <th className="admin-th">End Time</th>
                                            <th className="admin-th">Problems</th>
                                            <th className="admin-th">Participants</th>
                                            <th className="admin-th">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {contests.map(contest => (
                                            <tr key={contest.id} className="admin-row">
                                                <td className="admin-td">
                                                    <Link
                                                        to={`/contests/${contest.id}`}
                                                        className="admin-problem-link">
                                                        {contest.title}
                                                    </Link>
                                                </td>
                                                <td className="admin-td">
                                                    <span 
                                                        className="admin-status-badge"
                                                        style={{
                                                            ...(contest.status === 'ONGOING'
                                                                ? { color: '#10b981', background: 'rgba(16,185,129,0.08)' }
                                                                : contest.status === 'UPCOMING'
                                                                    ? { color: '#3b82f6', background: 'rgba(59,130,246,0.08)' }
                                                                    : { color: '#64748b', background: 'rgba(100,116,139,0.08)' })
                                                        }}
                                                    >
                                                        {contest.status}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <span className="admin-date">
                                                        {formatDate(contest.startTime)}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <span className="admin-date">
                                                        {formatDate(contest.endTime)}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <span className="admin-date">
                                                        {contest.totalProblems}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <span className="admin-date">
                                                        {contest.totalParticipants}
                                                    </span>
                                                </td>
                                                <td className="admin-td">
                                                    <div className="admin-actions">
                                                        <button
                                                            onClick={() =>
                                                                handleDeleteContest(contest.id)}
                                                            className="admin-danger-btn"
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

                {/* ── SUPPORT ── */}
                {activeTab === 'support' && (
                    <div style={styles.content}>
                        <div style={styles.contentHeader}>
                            <div>
                                <h1 style={styles.pageTitle}>Support Tickets</h1>
                                <p style={styles.pageSubtitle}>
                                    Manage user support requests and appeals
                                </p>
                            </div>
                            <div style={styles.ticketFilters}>
                                {['ALL', 'OPEN', 'RESOLVED'].map(f => (
                                    <button
                                        key={f}
                                        onClick={() => {
                                            setTicketFilter(f)
                                            setTicketPage(0)
                                        }}
                                        style={{
                                            ...styles.filterChip,
                                            ...(ticketFilter === f
                                                ? styles.filterChipActive : {})
                                        }}>
                                        {f === 'ALL' ? 'All' :
                                            f === 'OPEN' ? `Open (${openTicketCount})` :
                                                'Resolved'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={styles.tableCard}>
                            {loading ? (
                                <div style={styles.loadingDiv}>
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{ animation: 'spin 1s linear infinite' }} />
                                </div>
                            ) : tickets.length === 0 ? (
                                <div style={styles.empty}>
                                    <MessageSquare size={48} color="#374151" />
                                    <p style={styles.emptyText}>No tickets yet</p>
                                </div>
                            ) : (
                                tickets.map(ticket => (
                                    <div key={ticket.id} style={styles.ticketCard}>
                                        <div style={styles.ticketHeader}>
                                            <div style={styles.ticketLeft}>
                                                <span style={{
                                                    ...styles.ticketStatus,
                                                    color: ticket.status === 'OPEN'
                                                        ? '#f59e0b' : '#10b981',
                                                    background: ticket.status === 'OPEN'
                                                        ? 'rgba(245,158,11,0.1)'
                                                        : 'rgba(16,185,129,0.1)',
                                                }}>
                                                    {ticket.status}
                                                </span>
                                                <span style={styles.ticketSubject}>
                                                    {ticket.subject}
                                                </span>
                                            </div>
                                            <div style={styles.ticketRight}>
                                                <span style={styles.ticketDate}>
                                                    {formatDate(ticket.createdAt)}
                                                </span>
                                                {ticket.status === 'OPEN' && (
                                                    <button
                                                        onClick={() =>
                                                            handleResolveTicket(ticket.id)}
                                                        style={styles.resolveBtn}>
                                                        Mark Resolved
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div style={styles.ticketMeta}>
                                            <span style={styles.ticketSender}>
                                                From: <strong style={{ color: '#f9fafb' }}>
                                                    {ticket.name}
                                                </strong> ({ticket.email})
                                            </span>
                                        </div>
                                        <p style={styles.ticketMessage}>
                                            {ticket.message}
                                        </p>
                                        {ticket.resolvedAt && (
                                            <p style={styles.resolvedAt}>
                                                Resolved on {formatDate(ticket.resolvedAt)}
                                            </p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Pagination */}
                        {totalTicketPages > 1 && (
                            <div style={styles.pagination}>
                                <button
                                    onClick={() =>
                                        setTicketPage(p => Math.max(0, p - 1))}
                                    disabled={ticketPage === 0}
                                    style={{
                                        ...styles.pageBtn,
                                        opacity: ticketPage === 0 ? 0.4 : 1
                                    }}>
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>
                                <span style={styles.pageInfo}>
                                    Page {ticketPage + 1} of {totalTicketPages}
                                </span>
                                <button
                                    onClick={() =>
                                        setTicketPage(p =>
                                            Math.min(totalTicketPages - 1, p + 1))}
                                    disabled={ticketPage >= totalTicketPages - 1}
                                    style={{
                                        ...styles.pageBtn,
                                        opacity: ticketPage >= totalTicketPages - 1
                                            ? 0.4 : 1
                                    }}>
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── SUBMISSIONS ── */}
                {activeTab === 'submissions' && (
                    <div className="admin-content">
                        <h1 className="admin-page-title">All Submissions</h1>
                        <p className="admin-page-subtitle">
                            View all code submissions across the platform
                        </p>

                        <div className="admin-table-card">
                            {loading ? (
                                <div className="admin-loading-div">
                                    <Loader2 size={32} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                </div>
                            ) : (
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th className="admin-th">#</th>
                                            <th className="admin-th">User</th>
                                            <th className="admin-th">Problem</th>
                                            <th className="admin-th">Verdict</th>
                                            <th className="admin-th">Language</th>
                                            <th className="admin-th">Runtime</th>
                                            <th className="admin-th">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((sub, i) => {
                                            const vs = getVerdictStyle(sub.verdict)
                                            return (
                                                <tr key={sub.id} className="admin-row">
                                                    <td className="admin-td" style={{ color: '#94a3b8', fontWeight: '600' }}>
                                                        {i + 1}
                                                    </td>
                                                    <td className="admin-td">
                                                        <span className="admin-username">
                                                            {sub.username}
                                                        </span>
                                                    </td>
                                                    <td className="admin-td">
                                                        <Link
                                                            to={`/problems/${sub.problemId}`}
                                                            className="admin-problem-link">
                                                            {sub.problemTitle}
                                                        </Link>
                                                    </td>
                                                    <td className="admin-td">
                                                        <span 
                                                            className="admin-status-badge"
                                                            style={{
                                                                color: vs.color,
                                                                background: vs.bg
                                                            }}
                                                        >
                                                            {sub.verdict.replace(/_/g, ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="admin-td">
                                                        <span className="admin-tag" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                            {sub.language}
                                                        </span>
                                                    </td>
                                                    <td className="admin-td">
                                                        <span className="admin-date" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                                                            {sub.runtimeMs ? `${sub.runtimeMs}ms` : '—'}
                                                        </span>
                                                    </td>
                                                    <td className="admin-td">
                                                        <span className="admin-date">
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
                        <div className="admin-pagination">
                            <button
                                onClick={() =>
                                    setSubPage(p => Math.max(0, p - 1))}
                                disabled={subPage === 0}
                                className="admin-page-btn"
                                style={{ opacity: subPage === 0 ? 0.4 : 1 }}>
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            <span className="admin-page-info">
                                Page {subPage + 1} of {totalSubPages}
                            </span>
                            <button
                                onClick={() =>
                                    setSubPage(p =>
                                        Math.min(totalSubPages - 1, p + 1))}
                                disabled={subPage === totalSubPages - 1}
                                className="admin-page-btn"
                                style={{ opacity: subPage === totalSubPages - 1 ? 0.4 : 1 }}>
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ── CREATE CONTEST MODAL ── */}
            {showContestModal && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <div className="admin-modal-header">
                            <h3 className="admin-modal-title">Create New Contest</h3>
                            <button
                                onClick={() => {
                                    setShowContestModal(false)
                                    resetContestForm()
                                }}
                                className="admin-close-btn">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="admin-modal-body">
                            {/* Title */}
                            <div className="create-problem-form-group">
                                <label className="create-problem-label">Contest Title</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Weekly Contest 1"
                                    value={contestTitle}
                                    onChange={(e) => setContestTitle(e.target.value)}
                                    className="create-problem-input"
                                />
                            </div>

                            {/* Description */}
                            <div className="create-problem-form-group">
                                <label className="create-problem-label">Description</label>
                                <textarea
                                    placeholder="Enter contest description..."
                                    value={contestDesc}
                                    onChange={(e) => setContestDesc(e.target.value)}
                                    className="create-problem-textarea"
                                    style={{ minHeight: '80px' }}
                                />
                            </div>

                            {/* Date Grid */}
                            <div className="admin-date-grid">
                                <div className="create-problem-form-group">
                                    <label className="create-problem-label">Start Time</label>
                                    <input
                                        type="datetime-local"
                                        value={contestStart}
                                        onChange={(e) => setContestStart(e.target.value)}
                                        className="create-problem-input"
                                    />
                                </div>
                                <div className="create-problem-form-group">
                                    <label className="create-problem-label">End Time</label>
                                    <input
                                        type="datetime-local"
                                        value={contestEnd}
                                        onChange={(e) => setContestEnd(e.target.value)}
                                        className="create-problem-input"
                                    />
                                </div>
                            </div>

                            {/* Select Problems */}
                            <div className="create-problem-form-group">
                                <label className="create-problem-label">
                                    Select Problems ({selectedProblemIds.length} selected)
                                </label>
                                <div className="admin-problem-list-box">
                                    {problems.map(p => (
                                        <div
                                            key={p.id}
                                            onClick={() => toggleProblemSelection(p.id)}
                                            className={`admin-problem-select-item ${selectedProblemIds.includes(p.id) ? 'selected' : ''}`}>
                                            <input
                                                type="checkbox"
                                                checked={selectedProblemIds.includes(p.id)}
                                                onChange={() => { }} // Handled by div click
                                                style={{ pointerEvents: 'none' }}
                                            />
                                            <span className="admin-problem-select-title">
                                                {p.title}
                                            </span>
                                            <span 
                                                className="admin-diff-badge"
                                                style={{
                                                    marginLeft: 'auto',
                                                    color: getDiffStyle(p.difficulty).color,
                                                    background: getDiffStyle(p.difficulty).bg,
                                                    fontSize: '9px',
                                                    padding: '2px 6px'
                                                }}
                                            >
                                                {p.difficulty}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="admin-modal-footer">
                            <button
                                onClick={() => {
                                    setShowContestModal(false)
                                    resetContestForm()
                                }}
                                className="admin-cancel-btn">
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateContest}
                                disabled={creatingContest}
                                className="admin-contest-submit-btn">
                                {creatingContest ? 'Creating...' : 'Create Contest'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

const styles = {
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
    ticketFilters: {
        display: 'flex',
        gap: '8px',
    },
    filterChip: {
        padding: '7px 16px',
        background: 'transparent',
        border: '1px solid #1e2d45',
        borderRadius: '20px',
        color: '#6b7280',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
    },
    filterChipActive: {
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.3)',
        color: '#60a5fa',
    },
    tableCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        overflow: 'hidden',
        marginBottom: '20px',
    },
    loadingDiv: {
        display: 'flex',
        justifyContent: 'center',
        padding: '60px',
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
    ticketCard: {
        padding: '20px 24px',
        borderBottom: '1px solid #1e2d45',
    },
    ticketHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
        flexWrap: 'wrap',
        gap: '10px',
    },
    ticketLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    ticketStatus: {
        fontSize: '11px',
        fontWeight: '700',
        padding: '3px 10px',
        borderRadius: '20px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    ticketSubject: {
        fontSize: '15px',
        fontWeight: '700',
        color: '#f9fafb',
    },
    ticketRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    ticketDate: {
        fontSize: '12px',
        color: '#6b7280',
    },
    resolveBtn: {
        padding: '6px 14px',
        background: 'rgba(16,185,129,0.1)',
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '8px',
        color: '#10b981',
        fontSize: '12px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
    },
    ticketMeta: {
        marginBottom: '8px',
    },
    ticketSender: {
        fontSize: '12px',
        color: '#6b7280',
    },
    ticketMessage: {
        fontSize: '14px',
        color: '#d1d5db',
        lineHeight: '1.6',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        padding: '12px 16px',
        whiteSpace: 'pre-wrap',
    },
    resolvedAt: {
        fontSize: '12px',
        color: '#10b981',
        marginTop: '8px',
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
}
}