import Navbar from '../components/Navbar'
import { Code2, Target, Cpu, ShieldAlert, Award, Terminal } from 'lucide-react'
import './AboutPage.css'

export default function AboutPage() {
    return (
        <div className="about-page">
            <Navbar />

            {/* Glowing Blur Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>
            <div className="blob blob-blue"></div>

            {/* ── HERO SECTION ── */}
            <header className="about-hero">
                <div className="about-container">
                    <span className="section-label">Our Story</span>
                    <h1 className="about-hero-title">Empowering the Next Generation of Developers</h1>
                    <p className="about-hero-subtitle">
                        CodeArena was built as a modern online sandbox to challenge engineers, facilitate real-time competition, and provide accurate, instant code evaluation.
                    </p>
                </div>
            </header>

            {/* ── MISSION & VISION ── */}
            <section className="about-section">
                <div className="about-container grid-2">
                    <div className="about-content">
                        <div className="card-icon-wrapper blue-icon">
                            <Target size={24} />
                        </div>
                        <h2 className="about-section-title">Our Mission</h2>
                        <p className="about-text">
                            At CodeArena, our goal is to bridge the gap between learning syntax and mastering problem-solving. We believe that developer analytics should be intuitive, contests should be secure and fair, and writing code should be an aesthetically pleasing experience.
                        </p>
                        <p className="about-text">
                            We provide a clean environment where programmers can test themselves against edge cases, compete in real-time battles, and measure their progress on a public leaderboard.
                        </p>
                    </div>
                    <div className="about-visual">
                        <div className="about-card quote-card">
                            <span className="quote-mark">“</span>
                            <p className="quote-text">
                                The best way to predict the future is to code it. We built CodeArena to make algorithm training accessible, beautiful, and secure.
                            </p>
                            <h4 className="quote-author">CodeArena Engineering Team</h4>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── SYSTEM ARCHITECTURE (JUDGE ENGINE SHOWCASE) ── */}
            <section className="about-section bg-slate-light border-y">
                <div className="about-container">
                    <div className="section-header" style={{ marginBottom: '60px' }}>
                        <span className="section-label">How It Works</span>
                        <h2 className="section-title">The CodeArena Sandbox Architecture</h2>
                        <p className="section-description" style={{ margin: '0 auto' }}>
                            Explore how our custom judge engine securely compiles, runs, and grades developer submissions in real-time.
                        </p>
                    </div>

                    <div className="architecture-grid">
                        <div className="architecture-step">
                            <div className="step-num">01</div>
                            <h3 className="step-title">Secure Sandboxing</h3>
                            <p className="step-desc">
                                When you submit code, it is written to a unique, temporary file and executed in a process-isolated sandbox with tight CPU, memory, and networking limits.
                            </p>
                        </div>
                        <div className="architecture-step">
                            <div className="step-num">02</div>
                            <h3 className="step-title">Automated Compilation</h3>
                            <p className="step-desc">
                                Our backend compiles C++ and Java sources dynamically using g++ and javac, or runs Python and Node.js code through secure local interpreters.
                            </p>
                        </div>
                        <div className="architecture-step">
                            <div className="step-num">03</div>
                            <h3 className="step-title">Test Matrix Execution</h3>
                            <p className="step-desc">
                                We run your executable against hidden test case vectors, feeding inputs via standard input (stdin) and capturing stdout to assert correctness and speed.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CORE VALUES ── */}
            <section className="about-section">
                <div className="about-container">
                    <div className="section-header" style={{ marginBottom: '65px' }}>
                        <span className="section-label">Core Values</span>
                        <h2 className="section-title">What Drives CodeArena</h2>
                    </div>

                    <div className="values-grid">
                        <div className="value-card">
                            <Cpu size={24} className="value-icon blue" />
                            <h3 className="value-title">Technical Rigor</h3>
                            <p className="value-desc">We compile code on high-performance runners using Java 21, verifying solutions with multiple boundary test cases to ensure validity.</p>
                        </div>
                        <div className="value-card">
                            <ShieldAlert size={24} className="value-icon green" />
                            <h3 className="value-title">Fair Play First</h3>
                            <p className="value-desc">Contests disable copy-paste and right-click actions on our editors. Scoreboards use tiebreaker times to keep rankings fair.</p>
                        </div>
                        <div className="value-card">
                            <Award size={24} className="value-icon purple" />
                            <h3 className="value-title">Gamified Growth</h3>
                            <p className="value-desc">Earn points (Easy = 100, Med = 200, Hard = 300) to build your global profile rank, and track contest score statistics dynamically.</p>
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
