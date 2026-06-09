import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    Code2, LayoutDashboard, Trophy, Users,
    LogOut, User, ChevronDown, Shield, Menu, X
} from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
    const { user, logout, isAdmin } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)

    const handleLogout = () => {
        setMobileOpen(false)
        setDropdownOpen(false)
        logout()
        toast.success('Logged out successfully')
        navigate('/login')
    }

    const navLinks = [
        { path: '/problems', label: 'Problems', icon: LayoutDashboard },
        { path: '/contests', label: 'Contests', icon: Trophy },
        { path: '/leaderboard', label: 'Leaderboard', icon: Users },
    ]

    const isActive = (path) =>
        location.pathname === path ||
        location.pathname.startsWith(path + '/')

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">

                    {/* ── Logo ── */}
                    <Link to="/problems" className="navbar-logo">
                        <div className="navbar-logo-icon">
                            <Code2 size={20} color="#3b82f6" />
                        </div>
                        <span className="navbar-logo-text">
                            CodeArena
                        </span>
                    </Link>

                    {/* ── Desktop Nav Links (center) ── */}
                    <div className="navbar-links">
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`navbar-link${isActive(path) ? ' active' : ''}`}>
                                <Icon size={16} />
                                {label}
                                {isActive(path) && (
                                    <span className="navbar-active-dot" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* ── Right Side ── */}
                    <div className="navbar-right">

                        {/* Admin Badge */}
                        {isAdmin && (
                            <Link to="/admin" className="navbar-admin-badge">
                                <Shield size={13} />
                                Admin
                            </Link>
                        )}

                        {/* User Dropdown */}
                        <div className="navbar-dropdown-wrapper">
                            <button
                                className="navbar-avatar-btn"
                                onClick={() => {
                                    setDropdownOpen(!dropdownOpen)
                                    setMobileOpen(false)
                                }}>
                                <div className="navbar-avatar">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <span className="navbar-username">
                                    {user?.username}
                                </span>
                                <ChevronDown
                                    size={15}
                                    className={`navbar-chevron${dropdownOpen ? ' open' : ''}`}
                                />
                            </button>

                            {dropdownOpen && (
                                <div className="navbar-dropdown">
                                    <div className="navbar-dropdown-header">
                                        <p className="navbar-dropdown-name">
                                            {user?.username}
                                        </p>
                                        <p className="navbar-dropdown-email">
                                            {user?.email}
                                        </p>
                                    </div>
                                    <div className="navbar-dropdown-divider" />
                                    <Link
                                        to={`/profile/${user?.username}`}
                                        className="navbar-dropdown-item"
                                        onClick={() => setDropdownOpen(false)}>
                                        <User size={15} />
                                        My Profile
                                    </Link>
                                    {isAdmin && (
                                        <Link
                                            to="/admin"
                                            className="navbar-dropdown-item"
                                            onClick={() => setDropdownOpen(false)}>
                                            <Shield size={15} />
                                            Admin Panel
                                        </Link>
                                    )}
                                    <div className="navbar-dropdown-divider" />
                                    <button
                                        onClick={handleLogout}
                                        className="navbar-dropdown-item logout">
                                        <LogOut size={15} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Hamburger Button */}
                        <button
                            className="navbar-mobile-btn"
                            onClick={() => {
                                setMobileOpen(!mobileOpen)
                                setDropdownOpen(false)
                            }}
                            aria-label="Toggle menu">
                            {mobileOpen
                                ? <X size={20} />
                                : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* ── Mobile Menu ── */}
                {mobileOpen && (
                    <div className="navbar-mobile-menu">

                        {/* User Info Card */}
                        <div className="navbar-mobile-user-info">
                            <div className="navbar-mobile-avatar">
                                {user?.username?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="navbar-mobile-user-name">
                                    {user?.username}
                                </p>
                                <p className="navbar-mobile-user-email">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        {/* Nav Links */}
                        <span className="navbar-mobile-section-label">
                            Navigation
                        </span>
                        {navLinks.map(({ path, label, icon: Icon }) => (
                            <Link
                                key={path}
                                to={path}
                                className={`navbar-mobile-link${isActive(path) ? ' active' : ''}`}
                                onClick={() => setMobileOpen(false)}>
                                <Icon size={18} />
                                {label}
                            </Link>
                        ))}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="navbar-mobile-link"
                                onClick={() => setMobileOpen(false)}>
                                <Shield size={18} />
                                Admin Panel
                            </Link>
                        )}

                        <div className="navbar-mobile-divider" />

                        {/* Account Links */}
                        <span className="navbar-mobile-section-label">
                            Account
                        </span>
                        <Link
                            to={`/profile/${user?.username}`}
                            className="navbar-mobile-link"
                            onClick={() => setMobileOpen(false)}>
                            <User size={18} />
                            My Profile
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="navbar-mobile-link logout">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                )}
            </nav>

            {/* Overlay — closes dropdown when clicking outside */}
            {(dropdownOpen || mobileOpen) && (
                <div
                    className="navbar-overlay"
                    onClick={() => {
                        setDropdownOpen(false)
                        setMobileOpen(false)
                    }}
                />
            )}
        </>
    )
}