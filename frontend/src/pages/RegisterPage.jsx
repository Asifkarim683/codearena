import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Code2, User, Mail, Lock, UserPlus } from 'lucide-react'

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
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logo}>
                    <div style={styles.logoIcon}>
                        <Code2 size={22} color="#3b82f6" />
                    </div>
                    <span style={styles.logoText}>CodeArena</span>
                </div>

                <h2 style={styles.title}>Create Account</h2>
                <p style={styles.subtitle}>
                    Join CodeArena and start solving problems
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* Username */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username</label>
                        <div style={styles.inputWrapper}>
                            <User size={18} color="#6b7280"
                                style={styles.icon} />
                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} color="#6b7280"
                                style={styles.icon} />
                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <div style={styles.inputWrapper}>
                            <Lock size={18} color="#6b7280"
                                style={styles.icon} />
                            <input
                                type="password"
                                placeholder="Minimum 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                        {password.length > 0 && (
                            <div style={styles.passwordStrength}>
                                <div style={{
                                    ...styles.strengthBar,
                                    width: password.length >= 12 ? '100%'
                                        : password.length >= 8 ? '66%' : '33%',
                                    background: password.length >= 12
                                        ? '#10b981'
                                        : password.length >= 8
                                            ? '#f59e0b' : '#ef4444'
                                }} />
                                <span style={{
                                    ...styles.strengthText,
                                    color: password.length >= 12 ? '#10b981'
                                        : password.length >= 8
                                            ? '#f59e0b' : '#ef4444'
                                }}>
                                    {password.length >= 12 ? 'Strong'
                                        : password.length >= 8
                                            ? 'Good' : 'Weak'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1
                        }}>
                        {loading ? 'Creating account...' : (
                            <><UserPlus size={18} /> Create Account</>
                        )}
                    </button>
                </form>

                {/* Divider */}
                <div style={styles.divider}>
                    <div style={styles.dividerLine} />
                    <span style={styles.dividerText}>
                        Already have an account?
                    </span>
                    <div style={styles.dividerLine} />
                </div>

                <Link to="/login" style={styles.loginBtn}>
                    Sign In Instead
                </Link>

            </div>
        </div>
    )
}

const styles = {
    container: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at top, #1a2235 0%, #0a0e1a 70%)',
        padding: '20px',
    },
    card: {
        background: '#111827',
        borderRadius: '20px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px',
        border: '1px solid #1e2d45',
        boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '32px',
        justifyContent: 'center',
    },
    logoIcon: {
        width: '40px',
        height: '40px',
        background: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: '26px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.5px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#f9fafb',
        textAlign: 'center',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: '36px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
    },
    label: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
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
        padding: '13px 14px 13px 44px',
        background: '#0a0e1a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        color: '#f9fafb',
        fontSize: '14px',
        transition: 'border-color 0.2s',
    },
    passwordStrength: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginTop: '8px',
    },
    strengthBar: {
        height: '4px',
        borderRadius: '2px',
        flex: 1,
        transition: 'all 0.3s ease',
        background: '#ef4444',
    },
    strengthText: {
        fontSize: '12px',
        fontWeight: '600',
        minWidth: '40px',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '14px',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '700',
        marginTop: '8px',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
        transition: 'all 0.2s',
    },
    divider: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '24px 0 16px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        background: '#1e2d45',
    },
    dividerText: {
        fontSize: '13px',
        color: '#6b7280',
        whiteSpace: 'nowrap',
    },
    loginBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '13px',
        background: 'transparent',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#9ca3af',
        transition: 'all 0.2s',
        textDecoration: 'none',
    },
}