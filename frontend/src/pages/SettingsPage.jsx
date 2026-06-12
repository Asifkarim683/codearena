import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'
import {
    ArrowLeft, User, Mail, Lock,
    Save, Eye, EyeOff, Settings as SettingsIcon
} from 'lucide-react'

export default function SettingsPage() {
    const { user, updateUser } = useAuth()

    const [username, setUsername] = useState(user?.username || '')
    const [email, setEmail] = useState(user?.email || '')
    const [profileLoading, setProfileLoading] = useState(false)

    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)

    const handleProfileUpdate = async (e) => {
        e.preventDefault()
        if (!username.trim() || !email.trim()) {
            toast.error('Username and email are required')
            return
        }
        setProfileLoading(true)
        try {
            const res = await userService.updateProfile(
                username.trim(), email.trim())
            if (res.success === false) {
                toast.error(res.message || 'Failed to update profile')
            } else {
                toast.success('Profile updated successfully!')
                if (updateUser) {
                    updateUser({ ...user, username, email })
                }
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message
                || 'Failed to update profile')
        } finally {
            setProfileLoading(false)
        }
    }

    const handlePasswordChange = async (e) => {
        e.preventDefault()
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Please fill in all password fields')
            return
        }
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters')
            return
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        setPasswordLoading(true)
        try {
            const res = await userService.changePassword(
                currentPassword, newPassword)
            if (res.success === false) {
                toast.error(res.message || 'Failed to change password')
            } else {
                toast.success('Password changed successfully!')
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message
                || 'Failed to change password')
        } finally {
            setPasswordLoading(false)
        }
    }

    const passwordStrength = newPassword.length >= 12
        ? 'Strong' : newPassword.length >= 8 ? 'Good' : 'Weak'
    const strengthColor = newPassword.length >= 12
        ? '#10b981' : newPassword.length >= 8 ? '#f59e0b' : '#ef4444'

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                <Link to={`/profile/${user?.username}`} style={styles.backBtn}>
                    <ArrowLeft size={16} />
                    Back to Profile
                </Link>

                <div style={styles.header}>
                    <div style={styles.headerIcon}>
                        <SettingsIcon size={22} color="#3b82f6" />
                    </div>
                    <div>
                        <h1 style={styles.title}>Account Settings</h1>
                        <p style={styles.subtitle}>
                            Manage your profile information and security
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <form onSubmit={handleProfileUpdate} style={styles.card}>
                    <h3 style={styles.cardTitle}>
                        <User size={16} />
                        Profile Information
                    </h3>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Username</label>
                        <div style={styles.inputWrapper}>
                            <User size={16} color="#6b7280" style={styles.icon} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={16} color="#6b7280" style={styles.icon} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={profileLoading}
                        style={{
                            ...styles.saveBtn,
                            opacity: profileLoading ? 0.7 : 1
                        }}>
                        <Save size={15} />
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                {/* Password Card */}
                <form onSubmit={handlePasswordChange} style={styles.card}>
                    <h3 style={styles.cardTitle}>
                        <Lock size={16} />
                        Change Password
                    </h3>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Current Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={16} color="#6b7280" style={styles.icon} />
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                style={styles.input}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                style={styles.eyeBtn}>
                                {showCurrent
                                    ? <EyeOff size={16} />
                                    : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>New Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={16} color="#6b7280" style={styles.icon} />
                            <input
                                type={showNew ? 'text' : 'password'}
                                placeholder="Minimum 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                style={styles.input}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                style={styles.eyeBtn}>
                                {showNew
                                    ? <EyeOff size={16} />
                                    : <Eye size={16} />}
                            </button>
                        </div>
                        {newPassword.length > 0 && (
                            <div style={styles.strengthRow}>
                                <div style={styles.strengthBarBg}>
                                    <div style={{
                                        ...styles.strengthBar,
                                        width: newPassword.length >= 12 ? '100%'
                                            : newPassword.length >= 8 ? '66%' : '33%',
                                        background: strengthColor
                                    }} />
                                </div>
                                <span style={{
                                    ...styles.strengthLabel,
                                    color: strengthColor
                                }}>
                                    {passwordStrength}
                                </span>
                            </div>
                        )}
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Confirm New Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={16} color="#6b7280" style={styles.icon} />
                            <input
                                type="password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        style={{
                            ...styles.saveBtn,
                            opacity: passwordLoading ? 0.7 : 1
                        }}>
                        <Save size={15} />
                        {passwordLoading
                            ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
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
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0 24px',
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
        gap: '14px',
        marginBottom: '24px',
    },
    headerIcon: {
        width: '48px',
        height: '48px',
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    title: {
        fontSize: '22px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.3px',
    },
    subtitle: {
        fontSize: '13px',
        color: '#6b7280',
        marginTop: '2px',
    },
    card: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '20px',
    },
    cardTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: '20px',
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
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        position: 'absolute',
        left: '14px',
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        padding: '11px 14px 11px 42px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        color: '#f9fafb',
        fontSize: '14px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    eyeBtn: {
        position: 'absolute',
        right: '12px',
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    strengthRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '8px',
    },
    strengthBarBg: {
        height: '4px',
        background: '#1e2d45',
        borderRadius: '2px',
        flex: 1,
        overflow: 'hidden',
    },
    strengthBar: {
        height: '100%',
        borderRadius: '2px',
        transition: 'all 0.3s ease',
    },
    strengthLabel: {
        fontSize: '12px',
        fontWeight: '600',
        minWidth: '40px',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '12px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
    },
}