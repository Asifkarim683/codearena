import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import toast from 'react-hot-toast'
import {
    ArrowLeft, User, Mail, Lock,
    Save, Eye, EyeOff, Settings as SettingsIcon
} from 'lucide-react'
import './SettingsPage.css'

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
        <div className="settings-page">
            {/* Glowing background blobs */}
            <div className="blob blob-pink" />
            <div className="blob blob-mint" />

            <div className="settings-container">

                <Link to={`/profile/${user?.username}`} className="settings-back-btn">
                    <ArrowLeft size={16} />
                    Back to Profile
                </Link>

                <div className="settings-header">
                    <div className="settings-header-icon">
                        <SettingsIcon size={22} color="#3b82f6" />
                    </div>
                    <div>
                        <h1 className="settings-title">Account Settings</h1>
                        <p className="settings-subtitle">
                            Manage your profile information and security
                        </p>
                    </div>
                </div>

                {/* Profile Card */}
                <form onSubmit={handleProfileUpdate} className="settings-card">
                    <h3 className="settings-card-title">
                        <User size={16} style={{ color: '#3b82f6' }} />
                        Profile Information
                    </h3>

                    <div className="settings-form-group">
                        <label className="settings-label">Username</label>
                        <div className="settings-input-wrapper">
                            <User size={16} className="settings-input-icon" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="settings-input"
                            />
                        </div>
                    </div>

                    <div className="settings-form-group">
                        <label className="settings-label">Email</label>
                        <div className="settings-input-wrapper">
                            <Mail size={16} className="settings-input-icon" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="settings-input"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={profileLoading}
                        className="settings-save-btn">
                        <Save size={15} />
                        {profileLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>

                {/* Password Card */}
                <form onSubmit={handlePasswordChange} className="settings-card">
                    <h3 className="settings-card-title">
                        <Lock size={16} style={{ color: '#ef4444' }} />
                        Change Password
                    </h3>

                    <div className="settings-form-group">
                        <label className="settings-label">Current Password</label>
                        <div className="settings-input-wrapper">
                            <Lock size={16} className="settings-input-icon" />
                            <input
                                type={showCurrent ? 'text' : 'password'}
                                placeholder="Enter current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="settings-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="settings-eye-btn">
                                {showCurrent
                                    ? <EyeOff size={16} />
                                    : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="settings-form-group">
                        <label className="settings-label">New Password</label>
                        <div className="settings-input-wrapper">
                            <Lock size={16} className="settings-input-icon" />
                            <input
                                type={showNew ? 'text' : 'password'}
                                placeholder="Minimum 8 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="settings-input"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="settings-eye-btn">
                                {showNew
                                    ? <EyeOff size={16} />
                                    : <Eye size={16} />}
                            </button>
                        </div>
                        {newPassword.length > 0 && (
                            <div className="settings-strength-row">
                                <div className="settings-strength-bar-bg">
                                    <div 
                                        className="settings-strength-bar"
                                        style={{
                                            width: newPassword.length >= 12 ? '100%'
                                                : newPassword.length >= 8 ? '66%' : '33%',
                                            background: strengthColor
                                        }} 
                                    />
                                </div>
                                <span 
                                    className="settings-strength-label"
                                    style={{ color: strengthColor }}>
                                    {passwordStrength}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="settings-form-group">
                        <label className="settings-label">Confirm New Password</label>
                        <div className="settings-input-wrapper">
                            <Lock size={16} className="settings-input-icon" />
                            <input
                                type="password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="settings-input"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={passwordLoading}
                        className="settings-save-btn">
                        <Save size={15} />
                        {passwordLoading
                            ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </div>
    )
}