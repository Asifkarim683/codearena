import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Code2, User, Mail, Lock, UserPlus } from 'lucide-react'
import './Auth.css'

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!username || !email || !password) {
            toast.error('Please fill in all fields')
            return
        }
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters')
            return
        }
        setLoading(true)
        try {
            await register(username, email, password)
            toast.success('Account created successfully!')
            navigate('/problems')
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            {/* Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Code2 size={22} color="#3b82f6" />
                    </div>
                    <span className="auth-logo-text">CodeArena</span>
                </div>

                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join CodeArena and start solving problems</p>

                <form onSubmit={handleSubmit} className="auth-form">
                    {/* Username */}
                    <div className="auth-input-group">
                        <label className="auth-label">Username</label>
                        <div className="auth-input-wrapper">
                            <User size={18} className="auth-icon" />
                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="auth-input-group">
                        <label className="auth-label">Email</label>
                        <div className="auth-input-wrapper">
                            <Mail size={18} className="auth-icon" />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="auth-input-group">
                        <label className="auth-label">Password</label>
                        <div className="auth-input-wrapper">
                            <Lock size={18} className="auth-icon" />
                            <input
                                type="password"
                                placeholder="Minimum 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </div>
                        {password.length > 0 && (
                            <div className="auth-password-strength">
                                <div 
                                    className="auth-strength-bar"
                                    style={{
                                        width: password.length >= 12 ? '100%'
                                            : password.length >= 8 ? '66%' : '33%',
                                        background: password.length >= 12
                                            ? '#10b981'
                                            : password.length >= 8
                                                ? '#f59e0b' : '#ef4444'
                                    }} 
                                />
                                <span 
                                    className="auth-strength-text"
                                    style={{
                                        color: password.length >= 12 ? '#10b981'
                                            : password.length >= 8
                                                ? '#f59e0b' : '#ef4444'
                                    }}
                                >
                                    {password.length >= 12 ? 'Strong'
                                        : password.length >= 8
                                            ? 'Good' : 'Weak'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Creating account...' : (
                            <>
                                <UserPlus size={16} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div className="auth-divider">
                    <div className="auth-divider-line" />
                    <span className="auth-divider-text">Already have an account?</span>
                    <div className="auth-divider-line" />
                </div>

                <Link to="/login" className="auth-login-btn">
                    Sign In Instead
                </Link>
            </div>
        </div>
    )
}