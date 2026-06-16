import { useState } from 'react'
import { supportService } from '../services/supportService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    X, Send, MessageSquare, User,
    Mail, FileText, AlertCircle
} from 'lucide-react'

export default function ContactSupportModal({ onClose }) {
    const { user } = useAuth()
    const [name, setName] = useState(user?.username || '')
    const [email, setEmail] = useState(user?.email || '')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name || !email || !subject || !message) {
            toast.error('Please fill in all fields')
            return
        }
        setLoading(true)
        try {
            await supportService.submitTicket(
                name, email, subject, message)
            setSubmitted(true)
        } catch (error) {
            toast.error('Failed to send message. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerLeft}>
                        <div style={styles.headerIcon}>
                            <MessageSquare size={18} color="#3b82f6" />
                        </div>
                        <div>
                            <h2 style={styles.title}>Contact Support</h2>
                            <p style={styles.subtitle}>
                                We'll get back to you as soon as possible
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn}>
                        <X size={18} />
                    </button>
                </div>

                {submitted ? (
                    <div style={styles.successBody}>
                        <div style={styles.successIcon}>✅</div>
                        <h3 style={styles.successTitle}>Message Sent!</h3>
                        <p style={styles.successText}>
                            Your message has been received. Our admin team
                            will review it and get back to you at{' '}
                            <strong style={{ color: '#f9fafb' }}>{email}</strong>.
                        </p>
                        <button onClick={onClose} style={styles.doneBtn}>
                            Done
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={styles.body}>

                        {/* Info banner */}
                        <div style={styles.infoBanner}>
                            <AlertCircle size={14} color="#60a5fa" />
                            <span>
                                If your account was deactivated, include your
                                username and reason for appeal in the message.
                            </span>
                        </div>

                        {/* Name + Email */}
                        <div style={styles.row}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Your Name</label>
                                <div style={styles.inputWrapper}>
                                    <User size={14} color="#6b7280"
                                        style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        placeholder="Your name"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>Email Address</label>
                                <div style={styles.inputWrapper}>
                                    <Mail size={14} color="#6b7280"
                                        style={styles.inputIcon} />
                                    <input
                                        type="email"
                                        placeholder="Your email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subject */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Subject</label>
                            <div style={styles.inputWrapper}>
                                <FileText size={14} color="#6b7280"
                                    style={styles.inputIcon} />
                                <select
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    style={styles.select}>
                                    <option value="">Select a subject...</option>
                                    <option value="Account Deactivated">
                                        Account Deactivated — Appeal
                                    </option>
                                    <option value="Login Issue">
                                        Login Issue
                                    </option>
                                    <option value="Bug Report">
                                        Bug Report
                                    </option>
                                    <option value="Wrong Verdict">
                                        Wrong Verdict / Judge Issue
                                    </option>
                                    <option value="Feature Request">
                                        Feature Request
                                    </option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        {/* Message */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Message</label>
                            <textarea
                                placeholder="Describe your issue in detail..."
                                value={message}
                                onChange={e => setMessage(e.target.value)}
                                style={styles.textarea}
                                rows={5}
                            />
                        </div>

                        {/* Actions */}
                        <div style={styles.actions}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...styles.submitBtn,
                                    opacity: loading ? 0.7 : 1
                                }}>
                                <Send size={14} />
                                {loading ? 'Sending...' : 'Send Message'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    )
}

const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
    },
    modal: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '20px 24px',
        borderBottom: '1px solid #1e2d45',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    headerIcon: {
        width: '40px',
        height: '40px',
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    title: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: '2px',
    },
    subtitle: {
        fontSize: '12px',
        color: '#6b7280',
    },
    closeBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#9ca3af',
        cursor: 'pointer',
        flexShrink: 0,
    },
    body: {
        padding: '20px 24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    infoBanner: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: '8px',
        padding: '10px 14px',
        background: 'rgba(59,130,246,0.08)',
        border: '1px solid rgba(59,130,246,0.15)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#9ca3af',
        lineHeight: '1.5',
    },
    row: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '14px',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    label: {
        fontSize: '12px',
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
    inputIcon: {
        position: 'absolute',
        left: '12px',
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        padding: '10px 12px 10px 34px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#f9fafb',
        fontSize: '13px',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    },
    select: {
        width: '100%',
        padding: '10px 12px 10px 34px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#f9fafb',
        fontSize: '13px',
        fontFamily: 'inherit',
        cursor: 'pointer',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '10px 12px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#f9fafb',
        fontSize: '13px',
        fontFamily: 'inherit',
        resize: 'vertical',
        lineHeight: '1.6',
        boxSizing: 'border-box',
    },
    actions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '4px',
    },
    cancelBtn: {
        padding: '10px 20px',
        background: 'transparent',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#9ca3af',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '10px 22px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
    },
    successBody: {
        padding: '40px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        textAlign: 'center',
    },
    successIcon: {
        fontSize: '48px',
    },
    successTitle: {
        fontSize: '20px',
        fontWeight: '800',
        color: '#f9fafb',
    },
    successText: {
        fontSize: '14px',
        color: '#9ca3af',
        lineHeight: '1.6',
        maxWidth: '360px',
    },
    doneBtn: {
        marginTop: '8px',
        padding: '10px 28px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
}