import { useState } from 'react'
import Navbar from '../components/Navbar'
import { Code2, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react'
import './ContactPage.css'

export default function ContactPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleFormSubmit = (e) => {
        e.preventDefault()
        if (!name || !email || !subject || !message) return
        setLoading(true)
        setTimeout(() => {
            setLoading(false)
            setIsSubmitted(true)
            setName('')
            setEmail('')
            setSubject('')
            setMessage('')
        }, 1200)
    }

    return (
        <div className="contact-page">
            <Navbar />

            {/* Glowing Blur Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>
            <div className="blob blob-blue"></div>

            {/* ── HERO SECTION ── */}
            <header className="contact-hero">
                <div className="contact-container">
                    <span className="section-label">Contact Support</span>
                    <h1 className="contact-hero-title">We'd Love to Hear From You</h1>
                    <p className="contact-hero-subtitle">
                        Have a question, feedback about timed contests, or need to report a platform bug? Drop us a message below.
                    </p>
                </div>
            </header>

            {/* ── MAIN CONTENT GRID ── */}
            <section className="contact-section">
                <div className="contact-container grid-contact">
                    
                    {/* Left: Interactive Form Card */}
                    <div className="contact-form-wrapper">
                        {isSubmitted ? (
                            <div className="contact-success-card fade-in">
                                <div className="success-icon-wrapper">
                                    <CheckCircle2 size={36} />
                                </div>
                                <h3 className="success-title">Message Sent Successfully!</h3>
                                <p className="success-desc">
                                    Thank you for reaching out to CodeArena. Our engineering support team will review your message and respond within 24-48 hours.
                                </p>
                                <button 
                                    className="btn-success-reset"
                                    onClick={() => setIsSubmitted(false)}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <div className="contact-card form-card">
                                <h3 className="card-title-contact">Send a Message</h3>
                                <form onSubmit={handleFormSubmit} className="contact-form">
                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label className="contact-label">Your Name</label>
                                            <input 
                                                type="text" 
                                                placeholder="Enter name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="contact-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label className="contact-label">Your Email</label>
                                            <input 
                                                type="email" 
                                                placeholder="Enter email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="contact-input"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label className="contact-label">Subject</label>
                                        <input 
                                            type="text" 
                                            placeholder="Choose a subject"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="contact-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="contact-label">Message</label>
                                        <textarea 
                                            placeholder="Describe your request or issue..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="contact-textarea"
                                            rows="6"
                                            required
                                        ></textarea>
                                    </div>
                                    <button 
                                        type="submit" 
                                        className="btn-contact-submit"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <>
                                                <div className="skeleton-spinner" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={15} />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right: Info Sidebar */}
                    <div className="contact-info-sidebar">
                        <div className="contact-card info-card mint-theme">
                            <div className="info-item">
                                <div className="info-icon-badge bg-blue">
                                    <Mail size={18} />
                                </div>
                                <div className="info-meta">
                                    <span className="info-label-text">Support Email</span>
                                    <a href="mailto:support@codearena.com" className="info-value-text font-bold">
                                        support@codearena.com
                                    </a>
                                </div>
                            </div>
                            
                            <div className="info-item">
                                <div className="info-icon-badge bg-mint">
                                    <MapPin size={18} />
                                </div>
                                <div className="info-meta">
                                    <span className="info-label-text">Headquarters</span>
                                    <span className="info-value-text">
                                        Vite Tech Park, Sector 4<br />
                                        Bengaluru, Karnataka 560001
                                    </span>
                                </div>
                            </div>

                            <div className="info-item">
                                <div className="info-icon-badge bg-pink">
                                    <Clock size={18} />
                                </div>
                                <div className="info-meta">
                                    <span className="info-label-text">Working Hours</span>
                                    <span className="info-value-text">
                                        Monday - Friday<br />
                                        9:00 AM - 5:00 PM IST
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <Code2 size={20} color="#3b82f6" />
                        CodeArena
                    </div>
                    <div>&copy; {new Date().getFullYear()} CodeArena. All rights reserved. Built as an internship platform.</div>
                    <div className="footer-links">
                        <a href="/#features" className="footer-link">Features</a>
                        <a href="/#pricing" className="footer-link">Pricing</a>
                        <a href="/#contests" className="footer-link">Contests</a>
                    </div>
                </div>
            </footer>
        </div>
    )
}
