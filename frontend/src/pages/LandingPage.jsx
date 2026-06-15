import { Link } from 'react-router-dom'
import {
    Code2, Trophy, Zap, Users, ArrowRight,
    CheckCircle2, Terminal, BarChart2
} from 'lucide-react'

export default function LandingPage() {
    return (
        <div style={styles.page}>

            {/* Navbar */}
            <nav style={styles.nav}>
                <div style={styles.navContainer}>
                    <div style={styles.logo}>
                        <div style={styles.logoIcon}>
                            <Code2 size={20} color="#3b82f6" />
                        </div>
                        <span style={styles.logoText}>CodeArena</span>
                    </div>
                    <div style={styles.navActions}>
                        <Link to="/login" style={styles.loginLink}>
                            Sign In
                        </Link>
                        <Link to="/register" style={styles.registerBtn}>
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section style={styles.hero}>
                <div style={styles.heroBadge}>
                    <Zap size={13} />
                    Sharpen your coding skills
                </div>
                <h1 style={styles.heroTitle}>
                    Practice. Compete.<br />
                    <span style={styles.heroTitleAccent}>Level Up.</span>
                </h1>
                <p style={styles.heroSubtitle}>
                    CodeArena is an online coding platform where you solve
                    algorithmic problems, get instant feedback from a real
                    judge engine, and compete in live contests.
                </p>
                <div style={styles.heroActions}>
                    <Link to="/register" style={styles.primaryBtn}>
                        Start Solving
                        <ArrowRight size={16} />
                    </Link>
                    <Link to="/login" style={styles.secondaryBtn}>
                        Sign In
                    </Link>
                </div>
            </section>

            {/* Features */}
            <section style={styles.features}>
                <div style={styles.featuresGrid}>
                    {[
                        {
                            icon: Terminal,
                            color: '#3b82f6',
                            title: 'Online Code Editor',
                            desc: 'Write and run code directly in your browser with a full VS Code-powered editor supporting Java, Python, C++, and JavaScript.'
                        },
                        {
                            icon: CheckCircle2,
                            color: '#10b981',
                            title: 'Instant Verdicts',
                            desc: 'A custom judge engine compiles and runs your code against hidden test cases, returning verdicts in seconds.'
                        },
                        {
                            icon: Trophy,
                            color: '#f59e0b',
                            title: 'Live Contests',
                            desc: 'Compete in timed contests, earn points based on difficulty, and climb the contest scoreboard.'
                        },
                        {
                            icon: BarChart2,
                            color: '#6366f1',
                            title: 'Track Your Progress',
                            desc: 'Detailed profiles show your solved problems, acceptance rate, and contest performance over time.'
                        },
                        {
                            icon: Users,
                            color: '#ec4899',
                            title: 'Global Leaderboard',
                            desc: 'See how you rank against other coders based on the number of problems you have solved.'
                        },
                        {
                            icon: Code2,
                            color: '#06b6d4',
                            title: 'Curated Problems',
                            desc: 'A growing library of problems across difficulty levels and topics like arrays, strings, and graphs.'
                        },
                    ].map(({ icon: Icon, color, title, desc }) => (
                        <div key={title} style={styles.featureCard}>
                            <div style={{
                                ...styles.featureIcon,
                                background: `${color}18`,
                                border: `1px solid ${color}33`,
                            }}>
                                <Icon size={22} color={color} />
                            </div>
                            <h3 style={styles.featureTitle}>{title}</h3>
                            <p style={styles.featureDesc}>{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section style={styles.cta}>
                <div style={styles.ctaCard}>
                    <h2 style={styles.ctaTitle}>Ready to start coding?</h2>
                    <p style={styles.ctaSubtitle}>
                        Create a free account and solve your first problem in minutes.
                    </p>
                    <Link to="/register" style={styles.ctaBtn}>
                        Create Account
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer style={styles.footer}>
                <div style={styles.footerLogo}>
                    <Code2 size={16} color="#3b82f6" />
                    CodeArena
                </div>
                <p style={styles.footerText}>
                    Built as an internship project.
                </p>
            </footer>
        </div>
    )
}

const styles = {
    page: {
        background: '#0a0e1a',
        minHeight: '100vh',
    },

    // Nav
    nav: {
        borderBottom: '1px solid #1e2d45',
        position: 'sticky',
        top: 0,
        background: 'rgba(10,14,26,0.9)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
    },
    navContainer: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    logoIcon: {
        width: '36px',
        height: '36px',
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoText: {
        fontSize: '18px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.5px',
    },
    navActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
    },
    loginLink: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#9ca3af',
        textDecoration: 'none',
    },
    registerBtn: {
        padding: '9px 20px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '700',
        textDecoration: 'none',
        boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
    },

    // Hero
    hero: {
        maxWidth: '760px',
        margin: '0 auto',
        padding: '100px 24px 80px',
        textAlign: 'center',
    },
    heroBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 16px',
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.25)',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#60a5fa',
        marginBottom: '24px',
    },
    heroTitle: {
        fontSize: '52px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-1.5px',
        lineHeight: '1.15',
        marginBottom: '20px',
    },
    heroTitleAccent: {
        background: 'linear-gradient(135deg, #3b82f6, #818cf8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    heroSubtitle: {
        fontSize: '16px',
        color: '#9ca3af',
        lineHeight: '1.7',
        marginBottom: '32px',
        maxWidth: '560px',
        marginLeft: 'auto',
        marginRight: 'auto',
    },
    heroActions: {
        display: 'flex',
        justifyContent: 'center',
        gap: '14px',
        flexWrap: 'wrap',
    },
    primaryBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '13px 28px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '700',
        textDecoration: 'none',
        boxShadow: '0 6px 20px rgba(59,130,246,0.35)',
    },
    secondaryBtn: {
        display: 'flex',
        alignItems: 'center',
        padding: '13px 28px',
        background: 'transparent',
        border: '1px solid #1e2d45',
        color: '#d1d5db',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '700',
        textDecoration: 'none',
    },

    // Features
    features: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px 100px',
    },
    featuresGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
    },
    featureCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '16px',
        padding: '24px',
    },
    featureIcon: {
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
    },
    featureTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: '8px',
    },
    featureDesc: {
        fontSize: '13px',
        color: '#6b7280',
        lineHeight: '1.7',
    },

    // CTA
    cta: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px 100px',
    },
    ctaCard: {
        background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(99,102,241,0.06))',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '20px',
        padding: '60px 40px',
        textAlign: 'center',
    },
    ctaTitle: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.5px',
        marginBottom: '10px',
    },
    ctaSubtitle: {
        fontSize: '15px',
        color: '#9ca3af',
        marginBottom: '28px',
    },
    ctaBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: '13px 28px',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: 'white',
        borderRadius: '10px',
        fontSize: '15px',
        fontWeight: '700',
        textDecoration: 'none',
        boxShadow: '0 6px 20px rgba(59,130,246,0.35)',
    },

    // Footer
    footer: {
        borderTop: '1px solid #1e2d45',
        padding: '32px 24px',
        textAlign: 'center',
    },
    footerLogo: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        fontSize: '15px',
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: '6px',
    },
    footerText: {
        fontSize: '13px',
        color: '#6b7280',
    },
}