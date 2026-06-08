import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    Code2, LayoutDashboard, Trophy, Users,
    LogOut, User, ChevronDown, Shield, Menu, X
} from 'lucide-react'

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const navLinks = [
        { path: '/problems', label: 'Problems', icon: LayoutDashboard },
        { path: '/contests', label: 'Contests', icon: Trophy },
        { path: '/leaderboard', label: 'Leaderboard', icon: Users },
    ]

    const isActive = (path) => location.pathname === path ||
        location.pathname.startsWith(path + '/')

    return (
        <nav style={styles.nav}>
            <div style={styles.container}>

                {/* Logo */}
                <Link to="/problems" style={styles.logo}>
                    <div style={styles.logoIcon}>
                        <Code2 size={20} color="#3b82f6" />
                    </div>
                    <span style={styles.logoText}>CodeArena</span>
                </Link>

                {/* Desktop Nav Links */}
                <div style={styles.navLinks}>
                    {navLinks.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            style={{
                                ...styles.navLink,
                                ...(isActive(path) ? styles.navLinkActive : {})
                            }}>
                            <Icon size={16} />
                            {label}
                            {isActive(path) && (
                                <div style={styles.activeDot} />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right Side */}
                <div style={styles.right}>

                    {/* Admin Badge */}
                    {isAdmin && (
                        <Link to="/admin" style={styles.adminBadge}>
                            <Shield size={14} />
                            Admin
                        </Link>
                    )}

                    {/* User Dropdown */}
                    <div style={styles.dropdown}>
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            style={styles.avatarBtn}>
                            <div style={styles.avatar}>
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <span style={styles.username}>
                                {user?.username}
                            </span>
                            <ChevronDown
                                size={16}
                                color="#9ca3af"
                                style={{
                                    transform: dropdownOpen
                                        ? 'rotate(180deg)' : 'rotate(0)',
                                    transition: 'transform 0.2s'
                                }}
                            />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div style={styles.dropdownMenu}>
                                <div style={styles.dropdownHeader}>
                                    <p style={styles.dropdownName}>
                                        {user?.username}
                                    </p>
                                    <p style={styles.dropdownEmail}>
                                        {user?.email}
                                    </p>
                                </div>
                                <div style={styles.dropdownDivider} />
                                <Link
                                    to={`/profile/${user?.username}`}
                                    style={styles.dropdownItem}
                                    onClick={() => setDropdownOpen(false)}>
                                    <User size={15} />
                                    My Profile
                                </Link>
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        style={styles.dropdownItem}
                                        onClick={() => setDropdownOpen(false)}>
                                        <Shield size={15} />
                                        Admin Panel
                                    </Link>
                                )}
                                <div style={styles.dropdownDivider} />
                                <button
                                    onClick={handleLogout}
                                    style={{
                                        ...styles.dropdownItem,
                                        ...styles.logoutItem
                                    }}>
                                    <LogOut size={15} />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        style={styles.mobileBtn}
                        onClick={() => setMobileOpen(!mobileOpen)}>
                        {mobileOpen
                            ? <X size={22} /> : <Menu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div style={styles.mobileMenu}>
                    {navLinks.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            style={{
                                ...styles.mobileLink,
                                ...(isActive(path)
                                    ? styles.mobileLinkActive : {})
                            }}
                            onClick={() => setMobileOpen(false)}>
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </div>
            )}

            {/* Click outside to close dropdown */}
            {dropdownOpen && (
                <div
                    style={styles.overlay}
                    onClick={() => setDropdownOpen(false)}
                />
            )}
        </nav>
    )
}

const styles = {
    nav: {
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #1e2d45',
        height: '64px',
    },
    container: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '32px',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        textDecoration: 'none',
        flexShrink: 0,
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.5px',
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        flex: 1,
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#9ca3af',
        textDecoration: 'none',
        transition: 'all 0.2s',
        position: 'relative',
    },
    navLinkActive: {
        color: '#f9fafb',
        background: 'rgba(59, 130, 246, 0.1)',
    },
    activeDot: {
        position: 'absolute',
        bottom: '4px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '4px',
        height: '4px',
        borderRadius: '50%',
        background: '#3b82f6',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
    },
    adminBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        background: 'rgba(99, 102, 241, 0.1)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#818cf8',
        textDecoration: 'none',
    },
    dropdown: {
        position: 'relative',
    },
    avatarBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        background: 'rgba(30, 45, 69, 0.5)',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        cursor: 'pointer',
        transition: 'all 0.2s',
    },
    avatar: {
        width: '30px',
        height: '30px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '13px',
        fontWeight: '700',
        color: 'white',
    },
    username: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f9fafb',
    },
    dropdownMenu: {
        position: 'absolute',
        top: 'calc(100% + 8px)',
        right: 0,
        width: '220px',
        background: '#1a2235',
        border: '1px solid #1e2d45',
        borderRadius: '12px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        overflow: 'hidden',
        zIndex: 200,
    },
    dropdownHeader: {
        padding: '16px',
    },
    dropdownName: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#f9fafb',
    },
    dropdownEmail: {
        fontSize: '12px',
        color: '#6b7280',
        marginTop: '2px',
    },
    dropdownDivider: {
        height: '1px',
        background: '#1e2d45',
    },
    dropdownItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '11px 16px',
        fontSize: '14px',
        color: '#9ca3af',
        textDecoration: 'none',
        transition: 'all 0.15s',
        width: '100%',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    logoutItem: {
        color: '#ef4444',
    },
    overlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 150,
    },
    mobileBtn: {
        display: 'none',
        background: 'none',
        border: 'none',
        color: '#9ca3af',
        padding: '6px',
    },
    mobileMenu: {
        display: 'flex',
        flexDirection: 'column',
        padding: '12px',
        borderTop: '1px solid #1e2d45',
        background: '#111827',
    },
    mobileLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '15px',
        color: '#9ca3af',
        textDecoration: 'none',
    },
    mobileLinkActive: {
        color: '#f9fafb',
        background: 'rgba(59, 130, 246, 0.1)',
    },
}