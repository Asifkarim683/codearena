import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { problemService } from '../services/problemService'
import toast from 'react-hot-toast'
import {
    ArrowLeft, Plus, Trash2, Save,
    Code2, Tag, FileText, Settings
} from 'lucide-react'

export default function CreateProblemPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('details')

    // Problem fields
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [constraints, setConstraints] = useState('')
    const [difficulty, setDifficulty] = useState('EASY')
    const [timeLimit, setTimeLimit] = useState(2000)
    const [memoryLimit, setMemoryLimit] = useState(256)
    const [tagInput, setTagInput] = useState('')
    const [tags, setTags] = useState([])

    // Test cases
    const [testCases, setTestCases] = useState([
        { input: '', expectedOutput: '', isSample: true }
    ])

    const handleAddTag = (e) => {
        e.preventDefault()
        if (!tagInput.trim()) return
        if (tags.includes(tagInput.trim())) {
            toast.error('Tag already added')
            return
        }
        setTags([...tags, tagInput.trim()])
        setTagInput('')
    }

    const handleRemoveTag = (tag) => {
        setTags(tags.filter(t => t !== tag))
    }

    const handleAddTestCase = () => {
        setTestCases([...testCases,
        { input: '', expectedOutput: '', isSample: false }
        ])
    }

    const handleRemoveTestCase = (index) => {
        if (testCases.length === 1) {
            toast.error('At least one test case is required')
            return
        }
        setTestCases(testCases.filter((_, i) => i !== index))
    }

    const handleTestCaseChange = (index, field, value) => {
        const updated = [...testCases]
        updated[index][field] = value
        setTestCases(updated)
    }

    const handleSubmit = async () => {
        // Validation
        if (!title.trim()) {
            toast.error('Title is required')
            setActiveTab('details')
            return
        }
        if (!description.trim()) {
            toast.error('Description is required')
            setActiveTab('details')
            return
        }
        if (!constraints.trim()) {
            toast.error('Constraints are required')
            setActiveTab('details')
            return
        }
        if (testCases.some(tc =>
            !tc.input.trim() || !tc.expectedOutput.trim())) {
            toast.error('All test cases must have input and output')
            setActiveTab('testcases')
            return
        }

        setLoading(true)
        try {
            // Create problem
            const problemRes = await problemService.createProblem({
                title: title.trim(),
                description: description.trim(),
                constraints: constraints.trim(),
                difficulty,
                timeLimit: parseInt(timeLimit),
                memoryLimit: parseInt(memoryLimit),
                tags: tags,  // ✅ already a plain array, no Set() needed
            })

            const problemId = problemRes.data.id

            // Add test cases one by one
            for (let i = 0; i < testCases.length; i++) {
                await problemService.addTestCase(problemId, {
                    input: testCases[i].input,
                    expectedOutput: testCases[i].expectedOutput,
                    isSample: testCases[i].isSample,
                    orderIndex: i + 1,
                })
            }

            toast.success('Problem created successfully!')
            navigate('/admin')
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to create problem')
        } finally {
            setLoading(false)
        }
    }

    const tabs = [
        { id: 'details', label: 'Details', icon: FileText },
        { id: 'testcases', label: 'Test Cases', icon: Code2 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <Link to="/admin" style={styles.backBtn}>
                        <ArrowLeft size={16} />
                        Back to Admin
                    </Link>
                    <div style={styles.headerRight}>
                        <h1 style={styles.title}>Create New Problem</h1>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                ...styles.saveBtn,
                                opacity: loading ? 0.7 : 1
                            }}>
                            <Save size={16} />
                            {loading ? 'Creating...' : 'Create Problem'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div style={styles.tabs}>
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            style={{
                                ...styles.tab,
                                ...(activeTab === id ? styles.tabActive : {})
                            }}>
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── DETAILS TAB ── */}
                {activeTab === 'details' && (
                    <div style={styles.card}>

                        {/* Title */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Problem Title <span style={styles.required}>*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Two Sum"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                style={styles.input}
                            />
                        </div>

                        {/* Difficulty */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Difficulty <span style={styles.required}>*</span>
                            </label>
                            <div style={styles.difficultyBtns}>
                                {['EASY', 'MEDIUM', 'HARD'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        style={{
                                            ...styles.diffBtn,
                                            ...(difficulty === d
                                                ? getDiffActiveStyle(d) : {})
                                        }}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Problem Description <span style={styles.required}>*</span>
                            </label>
                            <p style={styles.hint}>
                                Explain the problem clearly. What should the user do?
                            </p>
                            <textarea
                                placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ ...styles.textarea, minHeight: '160px' }}
                            />
                        </div>

                        {/* Constraints */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>
                                Constraints <span style={styles.required}>*</span>
                            </label>
                            <p style={styles.hint}>
                                Define the input limits. One constraint per line.
                            </p>
                            <textarea
                                placeholder={`2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.`}
                                value={constraints}
                                onChange={(e) => setConstraints(e.target.value)}
                                style={{ ...styles.textarea, minHeight: '120px' }}
                            />
                        </div>

                        {/* Tags */}
                        <div style={styles.formGroup}>
                            <label style={styles.label}>Topic Tags</label>
                            <p style={styles.hint}>
                                Add relevant topic tags like Array, DP, Graph, String
                            </p>
                            <form
                                onSubmit={handleAddTag}
                                style={styles.tagInputRow}>
                                <div style={styles.tagInputWrapper}>
                                    <Tag size={15} color="#6b7280"
                                        style={styles.tagIcon} />
                                    <input
                                        type="text"
                                        placeholder="e.g. Array, Dynamic Programming..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        style={styles.tagInput}
                                    />
                                </div>
                                <button type="submit" style={styles.addTagBtn}>
                                    <Plus size={15} />
                                    Add Tag
                                </button>
                            </form>
                            {tags.length > 0 && (
                                <div style={styles.tagsList}>
                                    {tags.map(tag => (
                                        <span key={tag} style={styles.tagChip}>
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                style={styles.removeTagBtn}>
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TEST CASES TAB ── */}
                {activeTab === 'testcases' && (
                    <div>
                        <div style={styles.testCasesHeader}>
                            <p style={styles.hint}>
                                Add sample test cases (visible to users) and hidden
                                test cases (used for judging only).
                            </p>
                            <button
                                onClick={handleAddTestCase}
                                style={styles.addTcBtn}>
                                <Plus size={15} />
                                Add Test Case
                            </button>
                        </div>

                        {testCases.map((tc, index) => (
                            <div key={index} style={styles.testCaseCard}>
                                <div style={styles.testCaseHeader}>
                                    <span style={styles.testCaseTitle}>
                                        Test Case {index + 1}
                                    </span>
                                    <div style={styles.testCaseActions}>
                                        <label style={styles.sampleToggle}>
                                            <input
                                                type="checkbox"
                                                checked={tc.isSample}
                                                onChange={(e) => handleTestCaseChange(
                                                    index, 'isSample', e.target.checked)}
                                                style={{ marginRight: '6px' }}
                                            />
                                            <span style={{
                                                fontSize: '13px',
                                                color: tc.isSample ? '#10b981' : '#6b7280',
                                                fontWeight: '500'
                                            }}>
                                                {tc.isSample ? '👁 Visible to users' : '🔒 Hidden'}
                                            </span>
                                        </label>
                                        <button
                                            onClick={() => handleRemoveTestCase(index)}
                                            style={styles.removeTcBtn}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div style={styles.testCaseBody}>
                                    <div style={styles.tcField}>
                                        <label style={styles.tcLabel}>Input</label>
                                        <textarea
                                            placeholder="Enter input here..."
                                            value={tc.input}
                                            onChange={(e) => handleTestCaseChange(
                                                index, 'input', e.target.value)}
                                            style={styles.tcTextarea}
                                        />
                                    </div>
                                    <div style={styles.tcField}>
                                        <label style={styles.tcLabel}>
                                            Expected Output
                                        </label>
                                        <textarea
                                            placeholder="Enter expected output here..."
                                            value={tc.expectedOutput}
                                            onChange={(e) => handleTestCaseChange(
                                                index, 'expectedOutput', e.target.value)}
                                            style={styles.tcTextarea}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── SETTINGS TAB ── */}
                {activeTab === 'settings' && (
                    <div style={styles.card}>
                        <h3 style={styles.settingsTitle}>
                            Judge Settings
                        </h3>
                        <p style={styles.hint}>
                            Set the time and memory limits for code execution.
                        </p>

                        <div style={styles.settingsGrid}>
                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Time Limit (milliseconds)
                                </label>
                                <p style={styles.hint}>
                                    How long the code is allowed to run.
                                    Default: 2000ms
                                </p>
                                <input
                                    type="number"
                                    value={timeLimit}
                                    onChange={(e) =>
                                        setTimeLimit(e.target.value)}
                                    min="500"
                                    max="10000"
                                    step="500"
                                    style={styles.input}
                                />
                                <div style={styles.presets}>
                                    {[1000, 2000, 3000, 5000].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTimeLimit(t)}
                                            style={{
                                                ...styles.presetBtn,
                                                ...(timeLimit == t
                                                    ? styles.presetBtnActive : {})
                                            }}>
                                            {t}ms
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.label}>
                                    Memory Limit (MB)
                                </label>
                                <p style={styles.hint}>
                                    Maximum memory the code can use.
                                    Default: 256MB
                                </p>
                                <input
                                    type="number"
                                    value={memoryLimit}
                                    onChange={(e) =>
                                        setMemoryLimit(e.target.value)}
                                    min="64"
                                    max="512"
                                    step="64"
                                    style={styles.input}
                                />
                                <div style={styles.presets}>
                                    {[64, 128, 256, 512].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setMemoryLimit(m)}
                                            style={{
                                                ...styles.presetBtn,
                                                ...(memoryLimit == m
                                                    ? styles.presetBtnActive : {})
                                            }}>
                                            {m}MB
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div style={styles.summary}>
                            <h4 style={styles.summaryTitle}>
                                Problem Summary
                            </h4>
                            <div style={styles.summaryGrid}>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Title</span>
                                    <span style={styles.summaryValue}>
                                        {title || '—'}
                                    </span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>
                                        Difficulty
                                    </span>
                                    <span style={{
                                        ...styles.summaryValue,
                                        color: getDiffColor(difficulty)
                                    }}>
                                        {difficulty}
                                    </span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>Tags</span>
                                    <span style={styles.summaryValue}>
                                        {tags.length > 0
                                            ? tags.join(', ') : '—'}
                                    </span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>
                                        Test Cases
                                    </span>
                                    <span style={styles.summaryValue}>
                                        {testCases.length} total
                                        ({testCases.filter(
                                            tc => tc.isSample).length} sample)
                                    </span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>
                                        Time Limit
                                    </span>
                                    <span style={styles.summaryValue}>
                                        {timeLimit}ms
                                    </span>
                                </div>
                                <div style={styles.summaryItem}>
                                    <span style={styles.summaryLabel}>
                                        Memory Limit
                                    </span>
                                    <span style={styles.summaryValue}>
                                        {memoryLimit}MB
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Final Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            style={{
                                ...styles.finalBtn,
                                opacity: loading ? 0.7 : 1
                            }}>
                            <Save size={18} />
                            {loading ? 'Creating Problem...' : 'Create Problem'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

const getDiffColor = (d) => {
    switch (d) {
        case 'EASY': return '#10b981'
        case 'MEDIUM': return '#f59e0b'
        case 'HARD': return '#ef4444'
        default: return '#9ca3af'
    }
}

const getDiffActiveStyle = (d) => {
    switch (d) {
        case 'EASY': return {
            color: '#10b981',
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)'
        }
        case 'MEDIUM': return {
            color: '#f59e0b',
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)'
        }
        case 'HARD': return {
            color: '#ef4444',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)'
        }
        default: return {}
    }
}

const styles = {
    page: {
        minHeight: 'calc(100vh - 64px)',
        background: '#0a0e1a',
        padding: '32px 0 60px',
    },
    container: {
        maxWidth: '860px',
        margin: '0 auto',
        padding: '0 24px',
    },
    header: {
        marginBottom: '24px',
    },
    backBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        color: '#6b7280',
        fontSize: '13px',
        textDecoration: 'none',
        marginBottom: '16px',
    },
    headerRight: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
    },
    title: {
        fontSize: '24px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.3px',
    },
    saveBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '11px 24px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'none',
        borderRadius: '10px',
        color: 'white',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
    },
    tabs: {
        display: 'flex',
        gap: '4px',
        borderBottom: '1px solid #1e2d45',
        marginBottom: '24px',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '7px',
        padding: '12px 20px',
        background: 'none',
        border: 'none',
        fontSize: '14px',
        fontWeight: '500',
        color: '#6b7280',
        cursor: 'pointer',
        borderBottom: '2px solid transparent',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
    },
    tabActive: {
        color: '#3b82f6',
        borderBottom: '2px solid #3b82f6',
    },
    card: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        padding: '28px',
    },
    formGroup: {
        marginBottom: '24px',
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px',
    },
    required: {
        color: '#ef4444',
        marginLeft: '2px',
    },
    hint: {
        fontSize: '13px',
        color: '#4b5563',
        marginBottom: '8px',
        lineHeight: '1.5',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        color: '#f9fafb',
        fontSize: '14px',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
    },
    textarea: {
        width: '100%',
        padding: '12px 16px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        color: '#f9fafb',
        fontSize: '14px',
        fontFamily: "'JetBrains Mono', monospace",
        resize: 'vertical',
        lineHeight: '1.6',
        boxSizing: 'border-box',
    },
    difficultyBtns: {
        display: 'flex',
        gap: '10px',
    },
    diffBtn: {
        padding: '8px 24px',
        background: 'transparent',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '600',
        color: '#6b7280',
        cursor: 'pointer',
        transition: 'all 0.2s',
        fontFamily: 'inherit',
    },
    tagInputRow: {
        display: 'flex',
        gap: '10px',
        marginBottom: '12px',
    },
    tagInputWrapper: {
        flex: 1,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
    },
    tagIcon: {
        position: 'absolute',
        left: '12px',
        pointerEvents: 'none',
    },
    tagInput: {
        width: '100%',
        padding: '11px 14px 11px 36px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        color: '#f9fafb',
        fontSize: '14px',
        fontFamily: 'inherit',
    },
    addTagBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '11px 18px',
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '10px',
        color: '#60a5fa',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
    },
    tagsList: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
    },
    tagChip: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '5px 12px',
        background: '#1a2235',
        border: '1px solid #1e2d45',
        borderRadius: '20px',
        fontSize: '13px',
        color: '#9ca3af',
    },
    removeTagBtn: {
        background: 'none',
        border: 'none',
        color: '#6b7280',
        cursor: 'pointer',
        fontSize: '16px',
        lineHeight: 1,
        padding: '0',
        display: 'flex',
        alignItems: 'center',
    },
    testCasesHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px',
    },
    addTcBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '9px 18px',
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: '10px',
        color: '#60a5fa',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        fontFamily: 'inherit',
    },
    testCaseCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        marginBottom: '16px',
        overflow: 'hidden',
    },
    testCaseHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px',
        background: '#0f172a',
        borderBottom: '1px solid #1e2d45',
        flexWrap: 'wrap',
        gap: '10px',
    },
    testCaseTitle: {
        fontSize: '14px',
        fontWeight: '700',
        color: '#9ca3af',
    },
    testCaseActions: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    sampleToggle: {
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
    },
    removeTcBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30px',
        height: '30px',
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.2)',
        borderRadius: '8px',
        color: '#ef4444',
        cursor: 'pointer',
    },
    testCaseBody: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        padding: '16px 20px',
    },
    tcField: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    tcLabel: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    },
    tcTextarea: {
        padding: '10px 12px',
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#f9fafb',
        fontSize: '13px',
        fontFamily: "'JetBrains Mono', monospace",
        resize: 'vertical',
        minHeight: '100px',
        lineHeight: '1.5',
    },
    settingsTitle: {
        fontSize: '16px',
        fontWeight: '700',
        color: '#f9fafb',
        marginBottom: '4px',
    },
    settingsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '28px',
    },
    presets: {
        display: 'flex',
        gap: '8px',
        marginTop: '10px',
        flexWrap: 'wrap',
    },
    presetBtn: {
        padding: '6px 14px',
        background: 'transparent',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#6b7280',
        fontSize: '13px',
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s',
    },
    presetBtnActive: {
        color: '#3b82f6',
        background: 'rgba(59,130,246,0.1)',
        border: '1px solid rgba(59,130,246,0.3)',
    },
    summary: {
        background: '#0f172a',
        border: '1px solid #1e2d45',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '24px',
    },
    summaryTitle: {
        fontSize: '13px',
        fontWeight: '700',
        color: '#9ca3af',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '14px',
    },
    summaryGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
    },
    summaryItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '3px',
    },
    summaryLabel: {
        fontSize: '12px',
        color: '#4b5563',
        fontWeight: '500',
    },
    summaryValue: {
        fontSize: '14px',
        color: '#f9fafb',
        fontWeight: '600',
    },
    finalBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        width: '100%',
        padding: '14px',
        background: 'linear-gradient(135deg, #10b981, #059669)',
        border: 'none',
        borderRadius: '12px',
        color: 'white',
        fontSize: '15px',
        fontWeight: '700',
        cursor: 'pointer',
        fontFamily: 'inherit',
        boxShadow: '0 4px 16px rgba(16,185,129,0.3)',
    },
}