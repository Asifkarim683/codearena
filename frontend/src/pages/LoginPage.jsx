import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Code2, Mail, Lock, LogIn } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

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
            navigate('/')
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.container}>
            <div style={styles.card}>

                {/* Logo */}
                <div style={styles.logo}>
                    <Code2 size={40} color="#3b82f6" />
                    <h1 style={styles.logoText}>CodeArena</h1>
                </div>

                <h2 style={styles.title}>Welcome Back</h2>
                <p style={styles.subtitle}>
                    Login to continue solving problems
                </p>

                <form onSubmit={handleSubmit} style={styles.form}>

                    {/* Email */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Email</label>
                        <div style={styles.inputWrapper}>
                            <Mail size={18} color="#64748b"
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
                            <Lock size={18} color="#64748b"
                                style={styles.icon} />
                            <input
                                type="password"
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={styles.input}
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            ...styles.button,
                            opacity: loading ? 0.7 : 1
                        }}>
                        {loading ? 'Logging in...' : (
                            <>
                                <LogIn size={18} />
                                Login
                            </>
                        )}
                    </button>
                </form>

                <p style={styles.footer}>
                    Don't have an account?{' '}
                    <Link to="/register" style={styles.link}>
                        Register here
                    </Link>
                </p>
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
        boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.05)',
        animation: 'fadeIn 0.4s ease',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
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
        letterSpacing: '-0.3px',
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
        transition: 'border-color 0.2s, box-shadow 0.2s',
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
        transition: 'all 0.2s',
        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
        letterSpacing: '0.3px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '28px',
        fontSize: '14px',
        color: '#6b7280',
    },
    link: {
        color: '#3b82f6',
        fontWeight: '600',
    },
}