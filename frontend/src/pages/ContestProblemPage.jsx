import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { problemService } from '../services/problemService'
import { submissionService } from '../services/submissionService'
import { contestService } from '../services/contestService'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
    ChevronLeft, Play, Send, Clock, MemoryStick,
    CheckCircle2, XCircle, AlertCircle, Loader2,
    ChevronDown, ChevronUp, Tag, Trophy, ShieldAlert
} from 'lucide-react'

const LANGUAGES = [
    { value: 'JAVA', label: 'Java', monaco: 'java' },
    { value: 'PYTHON', label: 'Python 3', monaco: 'python' },
    { value: 'CPP', label: 'C++', monaco: 'cpp' },
    { value: 'JAVASCRIPT', label: 'JavaScript', monaco: 'javascript' },
]

const CODE_TEMPLATES = {
    JAVA: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // Write your solution here
    }
}`,
    PYTHON: `import sys
input = sys.stdin.readline

def solve():
    # Write your solution here
    pass

solve()`,
    CPP: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Write your solution here
    return 0;
}`,
    JAVASCRIPT: `const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
const lines = [];
rl.on('line', line => lines.push(line));
rl.on('close', () => {
    // Write your solution here
});`,
}

export default function ContestProblemPage() {
    const { id: contestId, problemId } = useParams()
    const navigate = useNavigate()
    const [problem, setProblem] = useState(null)
    const [contest, setContest] = useState(null)
    const [loading, setLoading] = useState(true)
    const [language, setLanguage] = useState('JAVA')
    const [code, setCode] = useState(CODE_TEMPLATES.JAVA)
    const [result, setResult] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [running, setRunning] = useState(false)
    const [activeTab, setActiveTab] = useState('description')
    const [resultOpen, setResultOpen] = useState(false)
    const [now, setNow] = useState(new Date())
    const [allSolved, setAllSolved] = useState(false)
    const pasteBlockedRef = useRef(false)
    const { user } = useAuth()

    useEffect(() => {
        fetchData()
        const timer = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(timer)
    }, [problemId])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [problemRes, contestRes] = await Promise.all([
                problemService.getProblemById(problemId),
                contestService.getContestById(contestId),
            ])
            setProblem(problemRes.data)
            setContest(contestRes.data)

            if (contestRes.data.status === 'UPCOMING') {
                toast.error('This contest has not started yet')
                navigate(`/contests/${contestId}`)
            }

            checkCompletion()
        } catch (error) {
            toast.error('Failed to load problem')
        } finally {
            setLoading(false)
        }
    }

    const handleLanguageChange = (lang) => {
        setLanguage(lang)
        setCode(CODE_TEMPLATES[lang])
    }

    // Disable copy/paste/cut on the editor
    const handleEditorMount = (editor) => {

        const domNode = editor.getDomNode()
        if (!domNode) return

        const blockEvent = (e) => {
            e.preventDefault()
            e.stopPropagation()
            if (!pasteBlockedRef.current) {
                pasteBlockedRef.current = true
                toast.error('Copy/Paste is disabled during contests')
                setTimeout(() => { pasteBlockedRef.current = false }, 1500)
            }
        }

        domNode.addEventListener('paste', blockEvent, true)
        domNode.addEventListener('copy', blockEvent, true)
        domNode.addEventListener('cut', blockEvent, true)
        domNode.addEventListener('contextmenu', (e) => e.preventDefault(), true)

        // Block Ctrl+C / Ctrl+V / Ctrl+X / Ctrl+Insert / Shift+Insert
        editor.onKeyDown((e) => {
            const isCopyPaste =
                (e.ctrlKey || e.metaKey) &&
                (e.keyCode === 33 ||
                    e.keyCode === 52 ||
                    e.keyCode === 54)
            if (isCopyPaste) {
                e.preventDefault()
                e.stopPropagation()
                if (!pasteBlockedRef.current) {
                    pasteBlockedRef.current = true
                    toast.error('Copy/Paste is disabled during contests')
                    setTimeout(() => { pasteBlockedRef.current = false }, 1500)
                }
            }
        })


    }

    const handleRun = async () => {
        if (!code.trim()) {
            toast.error('Please write some code first')
            return
        }
        setRunning(true)
        setResultOpen(true)
        setResult(null)
        try {
            const response = await submissionService.run(
                problemId, language, code)
            setResult({ ...response.data, isRun: true })
        } catch (error) {
            toast.error('Failed to run code')
        } finally {
            setRunning(false)
        }
    }

    const handleSubmit = async () => {
        if (!code.trim()) {
            toast.error('Please write some code first')
            return
        }
        setSubmitting(true)
        setResultOpen(true)
        setResult(null)
        try {
            const response = await submissionService.submit(
                problemId, language, code, contestId)
            setResult(response.data)
            if (response.data.verdict === 'ACCEPTED') {
                toast.success('Accepted! 🎉 Points added to your score')
                checkCompletion()
            } else {
                toast.error(`${response.data.verdict.replace(/_/g, ' ')}`)
            }
        } catch (error) {
            toast.error('Submission failed')
        } finally {
            setSubmitting(false)
        }
    }

    const checkCompletion = async () => {
        try {
            const res = await contestService.getScoreboard(contestId)
            const myEntry = (res.data || []).find(
                e => e.username === user?.username)
            if (myEntry && myEntry.solvedCount >= myEntry.totalProblems) {
                setAllSolved(true)
            }
        } catch (error) {
            // silent fail - non-critical
        }
    }

    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'ACCEPTED':
                return { color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: CheckCircle2 }
            case 'WRONG_ANSWER':
                return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle }
            case 'TIME_LIMIT_EXCEEDED':
                return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock }
            case 'COMPILATION_ERROR':
                return { color: '#6366f1', bg: 'rgba(99,102,241,0.1)', icon: AlertCircle }
            case 'RUNTIME_ERROR':
                return { color: '#f97316', bg: 'rgba(249,115,22,0.1)', icon: AlertCircle }
            default:
                return { color: '#6b7280', bg: 'rgba(107,114,128,0.1)', icon: AlertCircle }
        }
    }

    const getDifficultyStyle = (diff) => {
        switch (diff) {
            case 'EASY': return { color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
            case 'MEDIUM': return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' }
            case 'HARD': return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' }
            default: return {}
        }
    }

    const getRemainingTime = () => {
        if (!contest) return null
        const end = new Date(contest.endTime)
        const diff = end - now
        if (diff <= 0) return 'Ended'
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff / 60000) % 60)
        const s = Math.floor((diff / 1000) % 60)
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    }

    if (loading) return (
        <div style={styles.loadingContainer}>
            <Loader2 size={40} color="#3b82f6"
                style={{ animation: 'spin 1s linear infinite' }} />
        </div>
    )

    if (!problem || !contest) return (
        <div style={styles.loadingContainer}>
            <p style={{ color: '#6b7280' }}>Not found</p>
        </div>
    )

    const verdictInfo = result ? getVerdictStyle(result.verdict) : null
    const remaining = getRemainingTime()

    return (
        <div style={styles.wrapper}>

            {/* Contest Banner */}
            <div style={styles.contestBanner}>
                <Link
                    to={`/contests/${contestId}`}
                    style={styles.bannerBack}>
                    <ChevronLeft size={15} />
                    {contest.title}
                </Link>
                <div style={styles.bannerCenter}>
                    <ShieldAlert size={14} color="#f59e0b" />
                    <span style={styles.bannerWarning}>
                        Copy/Paste disabled during contest
                    </span>
                </div>
                <div style={styles.bannerTimer}>
                    <Clock size={14} />
                    {contest.status === 'ENDED'
                        ? 'Contest Ended'
                        : `Time left: ${remaining}`}
                </div>
            </div>

            <div style={styles.container}>

                {/* Left Panel */}
                <div style={styles.leftPanel}>
                    <div style={styles.problemHeader}>
                        <div style={styles.titleRow}>
                            <h1 style={styles.problemTitle}>{problem.title}</h1>
                            <span style={{
                                ...styles.diffBadge,
                                color: getDifficultyStyle(problem.difficulty).color,
                                background: getDifficultyStyle(problem.difficulty).bg
                            }}>
                                {problem.difficulty}
                            </span>
                            <span style={styles.pointsBadge}>
                                <Trophy size={12} />
                                {problem.points} pts
                            </span>
                        </div>

                        <div style={styles.statsRow}>
                            <span style={styles.stat}>
                                <Clock size={13} />
                                {problem.timeLimit}ms
                            </span>
                            <span style={styles.stat}>
                                <MemoryStick size={13} />
                                {problem.memoryLimit}MB
                            </span>
                        </div>

                        {problem.tags && problem.tags.length > 0 && (
                            <div style={styles.tagsRow}>
                                <Tag size={13} color="#6b7280" />
                                {problem.tags.map(tag => (
                                    <span key={tag} style={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    <div style={styles.tabs}>
                        {['description', 'examples'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    ...styles.tab,
                                    ...(activeTab === tab ? styles.tabActive : {})
                                }}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div style={styles.tabContent}>
                        {activeTab === 'description' && (
                            <div>
                                <div style={styles.section}>
                                    <h3 style={styles.sectionTitle}>Description</h3>
                                    <p style={styles.description}>
                                        {problem.description}
                                    </p>
                                </div>
                                <div style={styles.section}>
                                    <h3 style={styles.sectionTitle}>Constraints</h3>
                                    <pre style={styles.constraints}>
                                        {problem.constraints}
                                    </pre>
                                </div>
                            </div>
                        )}

                        {activeTab === 'examples' && (
                            <div>
                                {problem.sampleTestCases?.length > 0 ? (
                                    problem.sampleTestCases.map((tc, i) => (
                                        <div key={tc.id} style={styles.example}>
                                            <h4 style={styles.exampleTitle}>
                                                Example {i + 1}
                                            </h4>
                                            <div style={styles.ioBox}>
                                                <div style={styles.ioLabel}>Input:</div>
                                                <pre style={styles.ioContent}>
                                                    {tc.input}
                                                </pre>
                                            </div>
                                            <div style={styles.ioBox}>
                                                <div style={styles.ioLabel}>
                                                    Expected Output:
                                                </div>
                                                <pre style={styles.ioContent}>
                                                    {tc.expectedOutput}
                                                </pre>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: '#6b7280' }}>
                                        No sample test cases available
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Panel */}
                <div style={styles.rightPanel}>
                    {allSolved && (
                        <div style={styles.completeBanner}>
                            <Trophy size={16} color="#10b981" />
                            <span>
                                You've solved all problems in this contest!
                            </span>
                            <Link
                                to={`/contests/${contestId}/scoreboard`}
                                style={styles.completeLink}>
                                View Results & Scoreboard →
                            </Link>
                        </div>
                    )}
                    <div style={styles.editorHeader}>
                        <select
                            value={language}
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            style={styles.langSelect}>
                            {LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>
                                    {lang.label}
                                </option>
                            ))}
                        </select>
                        <div style={styles.editorActions}>
                            <button
                                onClick={handleRun}
                                disabled={running || submitting}
                                style={{
                                    ...styles.runBtn,
                                    opacity: running || submitting ? 0.7 : 1
                                }}>
                                {running
                                    ? <Loader2 size={15}
                                        style={{ animation: 'spin 1s linear infinite' }} />
                                    : <Play size={15} />}
                                {running ? 'Running...' : 'Run'}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={running || submitting || contest.status === 'ENDED'}
                                style={{
                                    ...styles.submitBtn,
                                    opacity: (running || submitting || contest.status === 'ENDED') ? 0.6 : 1
                                }}>
                                {submitting
                                    ? <Loader2 size={15}
                                        style={{ animation: 'spin 1s linear infinite' }} />
                                    : <Send size={15} />}
                                {submitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>

                    <div style={styles.editorWrapper}>
                        <Editor
                            height="100%"
                            language={
                                LANGUAGES.find(l => l.value === language)?.monaco
                            }
                            value={code}
                            onChange={(val) => setCode(val || '')}
                            onMount={handleEditorMount}
                            theme="vs-dark"
                            options={{
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                lineNumbers: 'on',
                                automaticLayout: true,
                                tabSize: 4,
                                wordWrap: 'on',
                                padding: { top: 16 },
                                contextmenu: false,
                            }}
                        />
                    </div>

                    {resultOpen && (
                        <div style={styles.resultPanel}>
                            <button
                                onClick={() => setResultOpen(!resultOpen)}
                                style={styles.resultToggle}>
                                <span style={styles.resultToggleText}>Result</span>
                                {resultOpen
                                    ? <ChevronDown size={16} />
                                    : <ChevronUp size={16} />}
                            </button>

                            <div style={styles.resultContent}>
                                {(running || submitting) && !result ? (
                                    <div style={styles.resultLoading}>
                                        <Loader2 size={24} color="#3b82f6"
                                            style={{ animation: 'spin 1s linear infinite' }} />
                                        <span style={{ color: '#6b7280' }}>
                                            {running
                                                ? 'Running against sample tests...'
                                                : 'Judging your submission...'}
                                        </span>
                                    </div>
                                ) : result ? (
                                    <div>
                                        <div style={styles.verdictRow}>
                                            {verdictInfo && (
                                                <>
                                                    <div style={{
                                                        ...styles.verdictBadge,
                                                        color: verdictInfo.color,
                                                        background: verdictInfo.bg,
                                                    }}>
                                                        <verdictInfo.icon size={18} />
                                                        {result.verdict.replace(/_/g, ' ')}
                                                    </div>
                                                    {result.runtimeMs && (
                                                        <span style={styles.runtimeStat}>
                                                            <Clock size={13} />
                                                            {result.runtimeMs}ms
                                                        </span>
                                                    )}
                                                    {result.verdict === 'ACCEPTED' && !result.isRun && (
                                                        <span style={styles.pointsEarned}>
                                                            <Trophy size={13} />
                                                            +{problem.points} points
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {result.errorMessage && (
                                            <pre style={styles.errorMsg}>
                                                {result.errorMessage}
                                            </pre>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: 'calc(100vh - 64px)',
        background: '#0a0e1a',
    },
    contestBanner: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 20px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(99,102,241,0.05))',
        borderBottom: '1px solid #1e2d45',
        flexWrap: 'wrap',
        gap: '10px',
    },
    bannerBack: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#f9fafb',
        textDecoration: 'none',
    },
    bannerCenter: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    },
    bannerWarning: {
        fontSize: '12px',
        color: '#f59e0b',
        fontWeight: '600',
    },
    bannerTimer: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: '700',
        color: '#60a5fa',
        fontFamily: "'JetBrains Mono', monospace",
    },
    container: {
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
    },
    leftPanel: {
        width: '42%',
        minWidth: '380px',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid #1e2d45',
        overflow: 'hidden',
    },
    problemHeader: {
        padding: '20px 24px 0',
        borderBottom: '1px solid #1e2d45',
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '12px',
        flexWrap: 'wrap',
    },
    problemTitle: {
        fontSize: '20px',
        fontWeight: '700',
        color: '#f9fafb',
        letterSpacing: '-0.3px',
    },
    diffBadge: {
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    pointsBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '700',
        color: '#f59e0b',
        background: 'rgba(245,158,11,0.1)',
    },
    statsRow: {
        display: 'flex',
        gap: '16px',
        marginBottom: '12px',
    },
    stat: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '12px',
        color: '#6b7280',
    },
    tagsRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexWrap: 'wrap',
        paddingBottom: '16px',
    },
    tag: {
        padding: '3px 10px',
        background: '#1a2235',
        border: '1px solid #1e2d45',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#9ca3af',
    },
    tabs: {
        display: 'flex',
        padding: '0 24px',
        borderBottom: '1px solid #1e2d45',
        background: '#0f172a',
    },
    tab: {
        padding: '12px 16px',
        background: 'none',
        border: 'none',
        fontSize: '13px',
        fontWeight: '500',
        color: '#6b7280',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        fontFamily: 'inherit',
    },
    tabActive: {
        color: '#3b82f6',
        borderBottom: '2px solid #3b82f6',
    },
    tabContent: {
        flex: 1,
        overflow: 'auto',
        padding: '20px 24px',
    },
    section: {
        marginBottom: '24px',
    },
    sectionTitle: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '10px',
    },
    description: {
        fontSize: '14px',
        color: '#d1d5db',
        lineHeight: '1.7',
        whiteSpace: 'pre-wrap',
    },
    constraints: {
        fontSize: '13px',
        color: '#d1d5db',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        padding: '12px 16px',
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'pre-wrap',
        lineHeight: '1.6',
    },
    example: {
        marginBottom: '20px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        padding: '16px',
    },
    exampleTitle: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#9ca3af',
        marginBottom: '12px',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    ioBox: {
        marginBottom: '10px',
    },
    ioLabel: {
        fontSize: '12px',
        color: '#6b7280',
        fontWeight: '500',
        marginBottom: '4px',
    },
    ioContent: {
        background: '#1a2235',
        border: '1px solid #1e2d45',
        borderRadius: '6px',
        padding: '10px 12px',
        fontSize: '13px',
        color: '#d1d5db',
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'pre-wrap',
    },
    rightPanel: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    editorHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: '#0f172a',
        borderBottom: '1px solid #1e2d45',
    },
    langSelect: {
        padding: '7px 12px',
        background: '#1a2235',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#f9fafb',
        fontSize: '13px',
        fontWeight: '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    editorActions: {
        display: 'flex',
        gap: '10px',
    },
    runBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 18px',
        background: 'transparent',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#d1d5db',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    submitBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 18px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'none',
        borderRadius: '8px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 2px 8px rgba(16,185,129,0.3)',
    },
    editorWrapper: {
        flex: 1,
        overflow: 'hidden',
    },
    resultPanel: {
        borderTop: '1px solid #1e2d45',
        background: '#0f172a',
        maxHeight: '200px',
    },
    resultToggle: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        padding: '10px 16px',
        background: 'none',
        border: 'none',
        borderBottom: '1px solid #1e2d45',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    resultToggleText: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#9ca3af',
    },
    resultContent: {
        padding: '16px',
        overflow: 'auto',
        maxHeight: '140px',
    },
    resultLoading: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '14px',
    },
    verdictRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
    },
    verdictBadge: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '8px',
        fontSize: '15px',
        fontWeight: '700',
    },
    runtimeStat: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '13px',
        color: '#6b7280',
    },
    pointsEarned: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '13px',
        fontWeight: '700',
        color: '#f59e0b',
    },
    errorMsg: {
        marginTop: '12px',
        padding: '12px',
        background: '#1a0a0a',
        border: '1px solid #3f1515',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#fca5a5',
        fontFamily: "'JetBrains Mono', monospace",
        whiteSpace: 'pre-wrap',
        overflow: 'auto',
        maxHeight: '80px',
    },
    loadingContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 'calc(100vh - 64px)',
        background: '#0a0e1a',
    },
    scoreboardLink: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#60a5fa',
        textDecoration: 'underline',
        marginLeft: 'auto',
    },
    completeBanner: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 16px',
        background: 'rgba(16,185,129,0.1)',
        borderBottom: '1px solid rgba(16,185,129,0.2)',
        fontSize: '13px',
        fontWeight: '600',
        color: '#10b981',
        flexWrap: 'wrap',
    },
    completeLink: {
        marginLeft: 'auto',
        fontSize: '13px',
        fontWeight: '700',
        color: '#60a5fa',
        textDecoration: 'underline',
    },
}