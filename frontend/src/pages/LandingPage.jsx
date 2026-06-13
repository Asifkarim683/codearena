import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import {
    Code2, Trophy, Users, Terminal, Cpu, Play,
    CheckCircle2, ArrowRight, ShieldCheck, HelpCircle,
    Zap, Sparkles, AlertCircle, Clock
} from 'lucide-react'
import './LandingPage.css'

export default function LandingPage() {
    const { isLoggedIn } = useAuth()
    const navigate = useNavigate()
    const [isCompiling, setIsCompiling] = useState(false)
    const [verdictShow, setVerdictShow] = useState(true)

    // Interactive editor action simulation
    const handleRunCode = () => {
        if (isCompiling) return
        setIsCompiling(true)
        setVerdictShow(false)
        
        setTimeout(() => {
            setIsCompiling(false)
            setVerdictShow(true)
        }, 1500)
    }

    return (
        <div className="landing-page">
            {/* Navigation Bar */}
            <Navbar />

            {/* Glowing Blur Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>
            <div className="blob blob-blue"></div>

            {/* ── HERO SECTION ── */}
            <section className="hero-section">
                <div className="hero-container">
                    
                    {/* Hero Left Content */}
                    <div className="hero-content fade-in">
                        <div className="hero-badge">
                            <span className="hero-badge-dot" />
                            <Sparkles size={14} style={{ color: '#eab308' }} />
                            Next-Gen Coding Sandbox
                        </div>
                        <h1 className="hero-title">
                            Code, Compete, and <span>Conquer</span>
                        </h1>
                        <p className="hero-description">
                            Master your algorithmic skills in a secure online sandbox. Solve challenges, compete in timed tournaments with live scoreboards, and earn your place on the global leaderboard.
                        </p>
                        
                        <div className="hero-actions">
                            {isLoggedIn ? (
                                <Link to="/problems" className="btn-hero-primary">
                                    Go to Dashboard
                                    <ArrowRight size={18} />
                                </Link>
                            ) : (
                                <>
                                    <Link to="/register" className="btn-hero-primary">
                                        Start Coding Now
                                        <ArrowRight size={18} />
                                    </Link>
                                    <Link to="/login" className="btn-hero-secondary">
                                        Explore Problems
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Hero Right Content (Monaco Editor Mockup) */}
                    <div className="editor-mockup-wrapper fade-in">
                        <div className="editor-mockup">
                            <div className="editor-header">
                                <div className="editor-dots">
                                    <span className="editor-dot red" />
                                    <span className="editor-dot yellow" />
                                    <span className="editor-dot green" />
                                </div>
                                <div className="editor-filename">Solution.java</div>
                                <span className="editor-lang">Java</span>
                            </div>
                            
                            <div className="editor-body">
                                <div className="code-line">
                                    <span className="line-num">1</span>
                                    <span className="code-content"><span className="code-keyword">public class</span> <span className="code-type">Solution</span> &#123;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">2</span>
                                    <span className="code-content code-indent"><span className="code-keyword">public int</span>[] <span className="code-type">twoSum</span>(<span className="code-keyword">int</span>[] nums, <span className="code-keyword">int</span> target) &#123;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">3</span>
                                    <span className="code-content code-indent-2"><span className="code-type">Map</span>&lt;<span className="code-type">Integer</span>, <span className="code-type">Integer</span>&gt; map = <span className="code-keyword">new</span> <span className="code-type">HashMap</span>&lt;&gt;();</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">4</span>
                                    <span className="code-content code-indent-2"><span className="code-keyword">for</span> (<span className="code-keyword">int</span> i = 0; i &lt; nums.length; i++) &#123;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">5</span>
                                    <span className="code-content code-indent-2" style={{ marginLeft: '60px' }}><span className="code-keyword">int</span> comp = target - nums[i];</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">6</span>
                                    <span className="code-content code-indent-2" style={{ marginLeft: '60px' }}><span className="code-keyword">if</span> (map.containsKey(comp)) &#123;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">7</span>
                                    <span className="code-content code-indent-2" style={{ marginLeft: '80px' }}><span className="code-keyword">return new int</span>[] &#123; map.get(comp), i &#125;;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">8</span>
                                    <span className="code-content code-indent-2" style={{ marginLeft: '60px' }}><span className="code-content">&#125;</span></span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">9</span>
                                    <span className="code-content code-indent-2" style={{ marginLeft: '60px' }}>map.put(nums[i], i);</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">10</span>
                                    <span className="code-content code-indent-2" style={{ marginLeft: '40px' }}>&#125;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">11</span>
                                    <span className="code-content code-indent-2"><span className="code-keyword">return new int</span>[] &#123;&#125;;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">12</span>
                                    <span className="code-content code-indent">&#125;</span>
                                </div>
                                <div className="code-line">
                                    <span className="line-num">13</span>
                                    <span className="code-content">&#125;</span>
                                </div>
                            </div>
                            
                            <div className="editor-footer">
                                <div className="editor-status">
                                    <Terminal size={14} />
                                    UTF-8 | Tab Size: 4
                                </div>
                                <button 
                                    className="btn-editor-submit" 
                                    onClick={handleRunCode}
                                    disabled={isCompiling}
                                >
                                    {isCompiling ? (
                                        <>
                                            <div className="skeleton-spinner" />
                                            Judging...
                                        </>
                                    ) : (
                                        <>
                                            <Play size={12} fill="white" />
                                            Run Solution
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Floating Verdict Notification */}
                        {verdictShow && (
                            <div className="verdict-floating-card">
                                <div className="verdict-icon-badge">
                                    <CheckCircle2 size={16} />
                                </div>
                                <div className="verdict-info">
                                    <span className="verdict-title">Submission Status</span>
                                    <span className="verdict-status">Accepted (24ms)</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </section>

            {/* ── FEATURES SECTION ── */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <span className="section-label">Features</span>
                    <h2 className="section-title">Built for Performance and Competition</h2>
                    <p className="section-description">
                        CodeArena offers all the key tools you need to sharpen your skills, test your limits, and climb the ranks.
                    </p>
                </div>

                <div className="features-grid">
                    
                    {/* Card 1: Online Code Sandbox */}
                    <div className="feature-card blue-theme">
                        <div className="card-icon-wrapper">
                            <Code2 size={24} />
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">Interactive Code Editor</h3>
                            <p className="card-description">
                                A high-performance code editor built with Monaco (the core of VS Code) that supports syntax highlighting, auto-formatting, and keyboard shortcuts.
                            </p>
                        </div>
                        <div className="card-stats-row">
                            <span className="card-stat-badge">
                                <Zap size={13} color="#3b82f6" />
                                Monaco Engine
                            </span>
                            <span className="card-stat-badge">
                                Java, C++, JS, Python
                            </span>
                        </div>
                    </div>

                    {/* Card 2: Automatic Test Engine */}
                    <div className="feature-card mint-theme">
                        <div className="card-icon-wrapper">
                            <Cpu size={24} />
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">Automated Judge Engine</h3>
                            <p className="card-description">
                                Submissions are instantly evaluated against standard input test cases inside process-isolated environments. Get feedback on speed, compilation errors, or memory limits.
                            </p>
                        </div>
                        <div className="card-stats-row">
                            <span className="card-stat-badge">
                                <CheckCircle2 size={13} color="#10b981" />
                                Isolated Executions
                            </span>
                            <span className="card-stat-badge">
                                Sandbox Enabled
                            </span>
                        </div>
                    </div>

                    {/* Card 3: Real-time Coding Battles */}
                    <div className="feature-card pink-theme">
                        <div className="card-icon-wrapper">
                            <Trophy size={24} />
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">Timed Contest Arena</h3>
                            <p className="card-description">
                                Join active coding tournaments where point-based scoring is active (Easy: 100, Med: 200, Hard: 300). Copy-paste protections are strictly enforced.
                            </p>
                        </div>
                        <div className="card-stats-row">
                            <span className="card-stat-badge">
                                <Clock size={13} color="#ec4899" />
                                Anti-Cheat Guard
                            </span>
                            <span className="card-stat-badge">
                                Live Countdown
                            </span>
                        </div>
                    </div>

                    {/* Card 4: Global Leaderboards */}
                    <div className="feature-card purple-theme">
                        <div className="card-icon-wrapper">
                            <Users size={24} />
                        </div>
                        <div className="card-content">
                            <h3 className="card-title">Global Rankings</h3>
                            <p className="card-description">
                                Track your overall points, problem acceptance rate, and rank on a global scoreboard. Admins are automatically filtered to keep metrics fair.
                            </p>
                        </div>
                        <div className="card-stats-row">
                            <span className="card-stat-badge">
                                <ShieldCheck size={13} color="#8b5cf6" />
                                Live Scoreboard
                            </span>
                            <span className="card-stat-badge">
                                Fair Ranking
                            </span>
                        </div>
                    </div>

                </div>
            </section>

            {/* ── CONTEST SPOTLIGHT BANNER ── */}
            <section id="contests" className="contest-spotlight">
                <div className="spotlight-container">
                    <div className="spotlight-banner">
                        <div className="spotlight-content">
                            <span className="spotlight-label">Arena Event</span>
                            <h3 className="spotlight-title">Ready for the Next Challenge?</h3>
                            <p className="spotlight-description">
                                Compete with developers globally in our weekly timed coding competitions. Solve multiple algorithms, secure your ranking on the scoreboard, and build your profile score!
                            </p>
                        </div>
                        <div className="spotlight-action">
                            {isLoggedIn ? (
                                <Link to="/contests" className="btn-spotlight">
                                    Enter Contest Arena
                                    <ArrowRight size={16} />
                                </Link>
                            ) : (
                                <Link to="/register" className="btn-spotlight">
                                    Register to Join
                                    <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CALL TO ACTION SECTION ── */}
            <section id="leaderboard" className="cta-section">
                <div className="cta-container">
                    <h2 className="cta-title">
                        Ready to level up your <span>Coding Game</span>?
                    </h2>
                    <p className="hero-description">
                        Create an account today and start solving problems, tracking your progress, and competing in coding events.
                    </p>
                    <div className="cta-buttons">
                        {isLoggedIn ? (
                            <Link to="/problems" className="btn-hero-primary">
                                Go to Problems
                                <ArrowRight size={18} />
                            </Link>
                        ) : (
                            <>
                                <Link to="/register" className="btn-hero-primary">
                                    Create Free Account
                                    <ArrowRight size={18} />
                                </Link>
                                <Link to="/login" className="btn-hero-secondary">
                                    Log In to Account
                                </Link>
                            </>
                        )}
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
                        <a href="#features" className="footer-link">Features</a>
                        <a href="#contests" className="footer-link">Contests</a>
                        <Link to="/login" className="footer-link">Log In</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
