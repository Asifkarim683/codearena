import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Code2, Mail, Lock, LogIn } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import ContactSupportModal from '../components/ContactSupportModal'
import './Auth.css'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()
    const [showSupport, setShowSupport] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email || !password) {
            toast.error('Please fill in all fields')
            return
        }
        setLoading(true)
        try {
            await login(email, password)
            toast.success('Welcome back!')
            navigate('/problems')
        } catch (error) {
            const message = error.response?.data?.message
                || error.response?.data?.error
                || 'Invalid email or password'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            {/* Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>

            {/* Back to Home */}
            <Link to="/" style={styles.backHome}>
                <ArrowLeft size={14} />
                Back to Home
            </Link>

            <div className="auth-card">
                {/* Logo */}
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Code2 size={22} color="#3b82f6" />
                    </div>
                    <span className="auth-logo-text">CodeArena</span>
                </div>

                <h2 className="auth-title">Welcome Back</h2>
                <p className="auth-subtitle">Login to continue solving problems</p>

                <form onSubmit={handleSubmit} className="auth-form">
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
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="auth-input"
                                required
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Logging in...' : (
                            <>
                                <LogIn size={16} />
                                Login
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Register here
                    </Link>
                </p>
                {/* Support Link */}
                <div style={styles.supportRow}>
                    <span style={styles.supportText}>
                        Having trouble accessing your account?
                    </span>
                    <button
                        onClick={() => setShowSupport(true)}
                        style={styles.supportLink}>
                        Contact Support
                    </button>
                </div>

                {showSupport && (
                    <ContactSupportModal
                        onClose={() => setShowSupport(false)}
                    />
                )}
            </div>
        </div>
    )
}

const styles = {
    backHome: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#6b7280',
        textDecoration: 'none',
        marginBottom: '24px',
    },
    supportRow: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        marginTop: '16px',
    },
    supportText: {
        fontSize: '12px',
        color: '#6b7280',
    },
    supportLink: {
        background: 'none',
        border: 'none',
        color: '#60a5fa',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
        textDecoration: 'underline',
}