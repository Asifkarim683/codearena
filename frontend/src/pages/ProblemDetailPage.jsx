import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Editor from '@monaco-editor/react'
import { problemService } from '../services/problemService'
import { submissionService } from '../services/submissionService'
import toast from 'react-hot-toast'
import {
    ChevronLeft, Play, Send, Clock, MemoryStick,
    CheckCircle2, XCircle, AlertCircle, Loader2,
    ChevronDown, ChevronUp, Tag
} from 'lucide-react'
import './ProblemDetailPage.css'

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

export default function ProblemDetailPage() {
    const { id } = useParams()
    const [problem, setProblem] = useState(null)
    const [loading, setLoading] = useState(true)
    const [language, setLanguage] = useState('JAVA')
    const [code, setCode] = useState(CODE_TEMPLATES.JAVA)
    const [result, setResult] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const [running, setRunning] = useState(false)
    const [activeTab, setActiveTab] = useState('description')
    const [resultOpen, setResultOpen] = useState(false)

    useEffect(() => {
        fetchProblem()
    }, [id])

    const fetchProblem = async () => {
        setLoading(true)
        try {
            const response = await problemService.getProblemById(id)
            setProblem(response.data)
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
                id, language, code)
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
                id, language, code)
            setResult(response.data)
            if (response.data.verdict === 'ACCEPTED') {
                toast.success('Accepted! 🎉')
            } else {
                toast.error(`${response.data.verdict.replace(/_/g, ' ')}`)
            }
        } catch (error) {
            toast.error('Submission failed')
        } finally {
            setSubmitting(false)
        }
    }

    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'ACCEPTED':
                return { color: '#10b981', bg: 'rgba(16,185,129,0.08)', icon: CheckCircle2 }
            case 'WRONG_ANSWER':
                return { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: XCircle }
            case 'TIME_LIMIT_EXCEEDED':
                return { color: '#d97706', bg: 'rgba(245,158,11,0.08)', icon: Clock }
            case 'COMPILATION_ERROR':
                return { color: '#6366f1', bg: 'rgba(99,102,241,0.08)', icon: AlertCircle }
            case 'RUNTIME_ERROR':
                return { color: '#f97316', bg: 'rgba(249,115,22,0.08)', icon: AlertCircle }
            default:
                return { color: '#6b7280', bg: 'rgba(107,114,128,0.08)', icon: AlertCircle }
        }
    }

    if (loading) return (
        <div className="detail-loading-container">
            <Loader2 size={40} color="#3b82f6"
                style={{ animation: 'spin 1s linear infinite' }} />
            <p className="detail-loading-text">
                Loading problem...
            </p>
        </div>
    )

    if (!problem) return (
        <div className="detail-loading-container">
            <p className="detail-loading-text">Problem not found</p>
        </div>
    )

    const verdictInfo = result
        ? getVerdictStyle(result.verdict) : null

    return (
        <div className="detail-container">
            {/* Glowing Blur Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>

            {/* Left Panel — Problem Description */}
            <div className="detail-left-panel">

                {/* Back + Title */}
                <div className="detail-problem-header">
                    <Link to="/problems" className="detail-back-btn">
                        <ChevronLeft size={16} />
                        Problems
                    </Link>
                    <div className="detail-title-row">
                        <h1 className="detail-problem-title">{problem.title}</h1>
                        <span className={`detail-diff-badge ${problem.difficulty.toLowerCase()}`}>
                            {problem.difficulty.charAt(0) +
                                problem.difficulty.slice(1).toLowerCase()}
                        </span>
                    </div>

                    {/* Stats Row */}
                    <div className="detail-stats-row">
                        <span className="detail-stat">
                            <Clock size={13} />
                            {problem.timeLimit}ms
                        </span>
                        <span className="detail-stat">
                            <MemoryStick size={13} />
                            {problem.memoryLimit}MB
                        </span>
                        <span className="detail-stat">
                            Acceptance: {problem.acceptanceRate?.toFixed(1)}%
                        </span>
                    </div>

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                        <div className="detail-tags-row">
                            <Tag size={13} color="#6b7280" />
                            {problem.tags.map(tag => (
                                <span key={tag} className="detail-tag">{tag}</span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="detail-tabs">
                    {['description', 'examples'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`detail-tab${activeTab === tab ? ' active' : ''}`}>
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="detail-tab-content">
                    {activeTab === 'description' && (
                        <div>
                            <div className="detail-section">
                                <h3 className="detail-section-title">Description</h3>
                                <p className="detail-description">
                                    {problem.description}
                                </p>
                            </div>
                            <div className="detail-section">
                                <h3 className="detail-section-title">Constraints</h3>
                                <pre className="detail-constraints">
                                    {problem.constraints}
                                </pre>
                            </div>
                        </div>
                    )}

                    {activeTab === 'examples' && (
                        <div>
                            {problem.sampleTestCases?.length > 0 ? (
                                problem.sampleTestCases.map((tc, i) => (
                                    <div key={tc.id} className="detail-example">
                                        <h4 className="detail-example-title">
                                            Example {i + 1}
                                        </h4>
                                        <div className="detail-io-box">
                                            <div className="detail-io-label">Input:</div>
                                            <pre className="detail-io-content">
                                                {tc.input}
                                            </pre>
                                        </div>
                                        <div className="detail-io-box">
                                            <div className="detail-io-label">
                                                Expected Output:
                                            </div>
                                            <pre className="detail-io-content">
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

            {/* Right Panel — Code Editor */}
            <div className="detail-right-panel">

                {/* Editor Header */}
                <div className="detail-editor-header">
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="detail-lang-select">
                        {LANGUAGES.map(lang => (
                            <option key={lang.value} value={lang.value}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                    <div className="detail-editor-actions">
                        <button
                            onClick={handleRun}
                            disabled={running || submitting}
                            className="detail-run-btn"
                        >
                            {running
                                ? <Loader2 size={15}
                                    style={{ animation: 'spin 1s linear infinite' }} />
                                : <Play size={15} />}
                            {running ? 'Running...' : 'Run'}
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={running || submitting}
                            className="detail-submit-btn"
                        >
                            {submitting
                                ? <Loader2 size={15}
                                    style={{ animation: 'spin 1s linear infinite' }} />
                                : <Send size={15} />}
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </div>

                {/* Monaco Editor */}
                <div className="detail-editor-wrapper">
                    <Editor
                        height="100%"
                        language={
                            LANGUAGES.find(l => l.value === language)?.monaco
                        }
                        value={code}
                        onChange={(val) => setCode(val || '')}
                        theme="vs-dark"
                        options={{
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            lineNumbers: 'on',
                            roundedSelection: false,
                            automaticLayout: true,
                            tabSize: 4,
                            wordWrap: 'on',
                            padding: { top: 16 },
                        }}
                    />
                </div>

                {/* Result Panel */}
                {resultOpen && (
                    <div className="detail-result-panel">
                        <button
                            onClick={() => setResultOpen(!resultOpen)}
                            className="detail-result-toggle">
                            <span className="detail-result-toggle-text">
                                Result
                            </span>
                            {resultOpen
                                ? <ChevronDown size={16} />
                                : <ChevronUp size={16} />}
                        </button>

                        <div className="detail-result-content">
                            {(running || submitting) && !result ? (
                                <div className="detail-result-loading">
                                    <Loader2 size={24} color="#3b82f6"
                                        style={{
                                            animation: 'spin 1s linear infinite'
                                        }} />
                                    <span>
                                        {running
                                            ? 'Running against sample tests...'
                                            : 'Judging your submission...'}
                                    </span>
                                </div>
                            ) : result ? (
                                <div>
                                    <div className="detail-verdict-row">
                                        {verdictInfo && (
                                            <>
                                                <div 
                                                    className="detail-verdict-badge"
                                                    style={{
                                                        color: verdictInfo.color,
                                                        background: verdictInfo.bg,
                                                    }}
                                                >
                                                    <verdictInfo.icon size={18} />
                                                    {result.verdict.replace(/_/g, ' ')}
                                                </div>
                                                {result.runtimeMs && (
                                                    <span className="detail-runtime-stat">
                                                        <Clock size={13} />
                                                        {result.runtimeMs}ms
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {result.errorMessage && (
                                        <pre className="detail-error-msg">
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
    )
}