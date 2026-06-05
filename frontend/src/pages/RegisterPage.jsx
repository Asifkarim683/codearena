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
            navigate('/')
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
                    <Code2 size={40} color="#3b82f6" />
                    <h1 style={styles.logoText}>CodeArena</h1>
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
                            <User size={18} color="#64748b"
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
                                placeholder="Min 8 characters"
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
                        {loading ? 'Creating account...' : (
                            <>
                                <UserPlus size={18} />
                                Create Account
                            </>
                        )}
                    </button>
                </form>

                <p style={styles.footer}>
                    Already have an account?{' '}
                    <Link to="/login" style={styles.link}>
                        Login here
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
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        padding: '20px',
    },
    card: {
        background: '#1e293b',
        borderRadius: '16px',
        padding: '40px',
        width: '100%',
        maxWidth: '420px',
        border: '1px solid #334155',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#f1f5f9',
    },
    title: {
        fontSize: '22px',
        fontWeight: '600',
        color: '#f1f5f9',
        textAlign: 'center',
        marginBottom: '8px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#64748b',
        textAlign: 'center',
        marginBottom: '32px',
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
        fontSize: '14px',
        fontWeight: '500',
        color: '#94a3b8',
    },
    inputWrapper: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    icon: {
        position: 'absolute',
        left: '14px',
    },
    input: {
        width: '100%',
        padding: '12px 14px 12px 42px',
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '8px',
        color: '#f1f5f9',
        fontSize: '14px',
    },
    button: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '13px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '600',
        marginTop: '8px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
        color: '#64748b',
    },
    link: {
        color: '#3b82f6',
        fontWeight: '500',
    },
}