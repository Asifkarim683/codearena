import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { problemService } from '../services/problemService'
import toast from 'react-hot-toast'
import {
    ArrowLeft, Plus, Trash2, Save,
    Code2, Tag, FileText, Settings
} from 'lucide-react'
import './CreateProblemPage.css'

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
                tags: tags,
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
        <div className="create-problem-page">
            {/* Glowing Backdrop Blobs */}
            <div className="blob blob-pink" />
            <div className="blob blob-mint" />
            <div className="blob blob-blue" />

            <div className="create-problem-container">

                {/* Header */}
                <div className="create-problem-header">
                    <Link to="/admin" className="create-problem-back-btn">
                        <ArrowLeft size={16} />
                        Back to Admin
                    </Link>
                    <div className="create-problem-header-right">
                        <h1 className="create-problem-title">Create New Problem</h1>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="create-problem-save-btn"
                            style={{ opacity: loading ? 0.7 : 1 }}>
                            <Save size={16} />
                            {loading ? 'Creating...' : 'Create Problem'}
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="create-problem-tabs">
                    {tabs.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => setActiveTab(id)}
                            className={`create-problem-tab${activeTab === id ? ' create-problem-tab-active' : ''}`}>
                            <Icon size={15} />
                            {label}
                        </button>
                    ))}
                </div>

                {/* ── DETAILS TAB ── */}
                {activeTab === 'details' && (
                    <div className="create-problem-card">

                        {/* Title */}
                        <div className="create-problem-form-group">
                            <label className="create-problem-label">
                                Problem Title <span className="create-problem-required">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Two Sum"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="create-problem-input"
                            />
                        </div>

                        {/* Difficulty */}
                        <div className="create-problem-form-group">
                            <label className="create-problem-label">
                                Difficulty <span className="create-problem-required">*</span>
                            </label>
                            <div className="create-problem-difficulty-btns">
                                {['EASY', 'MEDIUM', 'HARD'].map(d => (
                                    <button
                                        key={d}
                                        onClick={() => setDifficulty(d)}
                                        className="create-problem-diff-btn"
                                        style={difficulty === d ? getDiffActiveStyle(d) : {}}>
                                        {d}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="create-problem-form-group">
                            <label className="create-problem-label">
                                Problem Description <span className="create-problem-required">*</span>
                            </label>
                            <p className="create-problem-hint">
                                Explain the problem clearly. What should the user do?
                            </p>
                            <textarea
                                placeholder="Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="create-problem-textarea"
                                style={{ minHeight: '160px' }}
                            />
                        </div>

                        {/* Constraints */}
                        <div className="create-problem-form-group">
                            <label className="create-problem-label">
                                Constraints <span className="create-problem-required">*</span>
                            </label>
                            <p className="create-problem-hint">
                                Define the input limits. One constraint per line.
                            </p>
                            <textarea
                                placeholder={`2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.`}
                                value={constraints}
                                onChange={(e) => setConstraints(e.target.value)}
                                className="create-problem-textarea"
                                style={{ minHeight: '120px' }}
                            />
                        </div>

                        {/* Tags */}
                        <div className="create-problem-form-group">
                            <label className="create-problem-label">Topic Tags</label>
                            <p className="create-problem-hint">
                                Add relevant topic tags like Array, DP, Graph, String
                            </p>
                            <form
                                onSubmit={handleAddTag}
                                className="create-problem-tag-input-row">
                                <div className="create-problem-tag-input-wrapper">
                                    <Tag size={15} color="#64748b" className="create-problem-tag-icon" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Array, Dynamic Programming..."
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        className="create-problem-tag-input"
                                    />
                                </div>
                                <button type="submit" className="create-problem-add-tag-btn">
                                    <Plus size={15} />
                                    Add Tag
                                </button>
                            </form>
                            {tags.length > 0 && (
                                <div className="create-problem-tags-list">
                                    {tags.map(tag => (
                                        <span key={tag} className="create-problem-tag-chip">
                                            {tag}
                                            <button
                                                onClick={() => handleRemoveTag(tag)}
                                                className="create-problem-remove-tag-btn">
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
                        <div className="create-problem-tc-header">
                            <p className="create-problem-hint" style={{ margin: 0 }}>
                                Add sample test cases (visible to users) and hidden
                                test cases (used for judging only).
                            </p>
                            <button
                                onClick={handleAddTestCase}
                                className="create-problem-add-tc-btn">
                                <Plus size={15} />
                                Add Test Case
                            </button>
                        </div>

                        {testCases.map((tc, index) => (
                            <div key={index} className="create-problem-tc-card">
                                <div className="create-problem-tc-card-header">
                                    <span className="create-problem-tc-title">
                                        Test Case {index + 1}
                                    </span>
                                    <div className="create-problem-tc-actions">
                                        <label className="create-problem-sample-toggle">
                                            <input
                                                type="checkbox"
                                                checked={tc.isSample}
                                                onChange={(e) => handleTestCaseChange(
                                                    index, 'isSample', e.target.checked)}
                                                style={{ marginRight: '6px' }}
                                            />
                                            <span style={{
                                                fontSize: '13px',
                                                color: tc.isSample ? '#10b981' : '#64748b',
                                                fontWeight: '600'
                                            }}>
                                                {tc.isSample ? '👁 Visible to users' : '🔒 Hidden'}
                                            </span>
                                        </label>
                                        <button
                                            onClick={() => handleRemoveTestCase(index)}
                                            className="create-problem-remove-tc-btn">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="create-problem-tc-body">
                                    <div className="create-problem-tc-field">
                                        <label className="create-problem-tc-label">Input</label>
                                        <textarea
                                            placeholder="Enter input here..."
                                            value={tc.input}
                                            onChange={(e) => handleTestCaseChange(
                                                index, 'input', e.target.value)}
                                            className="create-problem-tc-textarea"
                                        />
                                    </div>
                                    <div className="create-problem-tc-field">
                                        <label className="create-problem-tc-label">
                                            Expected Output
                                        </label>
                                        <textarea
                                            placeholder="Enter expected output here..."
                                            value={tc.expectedOutput}
                                            onChange={(e) => handleTestCaseChange(
                                                index, 'expectedOutput', e.target.value)}
                                            className="create-problem-tc-textarea"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── SETTINGS TAB ── */}
                {activeTab === 'settings' && (
                    <div className="create-problem-card">
                        <h3 className="create-problem-settings-title">
                            Judge Settings
                        </h3>
                        <p className="create-problem-hint">
                            Set the time and memory limits for code execution.
                        </p>

                        <div className="create-problem-settings-grid">
                            <div className="create-problem-form-group">
                                <label className="create-problem-label">
                                    Time Limit (milliseconds)
                                </label>
                                <p className="create-problem-hint">
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
                                    className="create-problem-input"
                                />
                                <div className="create-problem-presets">
                                    {[1000, 2000, 3000, 5000].map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setTimeLimit(t)}
                                            className={`create-problem-preset-btn ${timeLimit == t ? 'create-problem-preset-btn-active' : ''}`}>
                                            {t}ms
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="create-problem-form-group">
                                <label className="create-problem-label">
                                    Memory Limit (MB)
                                </label>
                                <p className="create-problem-hint">
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
                                    className="create-problem-input"
                                />
                                <div className="create-problem-presets">
                                    {[64, 128, 256, 512].map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setMemoryLimit(m)}
                                            className={`create-problem-preset-btn ${memoryLimit == m ? 'create-problem-preset-btn-active' : ''}`}>
                                            {m}MB
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="create-problem-summary">
                            <h4 className="create-problem-summary-title">
                                Problem Summary
                            </h4>
                            <div className="create-problem-summary-grid">
                                <div className="create-problem-summary-item">
                                    <span className="create-problem-summary-label">Title</span>
                                    <span className="create-problem-summary-value">
                                        {title || '—'}
                                    </span>
                                </div>
                                <div className="create-problem-summary-item">
                                    <span className="create-problem-summary-label">
                                        Difficulty
                                    </span>
                                    <span 
                                        className="create-problem-summary-value"
                                        style={{ color: getDiffColor(difficulty) }}>
                                        {difficulty}
                                    </span>
                                </div>
                                <div className="create-problem-summary-item">
                                    <span className="create-problem-summary-label">Tags</span>
                                    <span className="create-problem-summary-value">
                                        {tags.length > 0
                                            ? tags.join(', ') : '—'}
                                    </span>
                                </div>
                                <div className="create-problem-summary-item">
                                    <span className="create-problem-summary-label">
                                        Test Cases
                                    </span>
                                    <span className="create-problem-summary-value">
                                        {testCases.length} total
                                        ({testCases.filter(
                                            tc => tc.isSample).length} sample)
                                    </span>
                                </div>
                                <div className="create-problem-summary-item">
                                    <span className="create-problem-summary-label">
                                        Time Limit
                                    </span>
                                    <span className="create-problem-summary-value">
                                        {timeLimit}ms
                                    </span>
                                </div>
                                <div className="create-problem-summary-item">
                                    <span className="create-problem-summary-label">
                                        Memory Limit
                                    </span>
                                    <span className="create-problem-summary-value">
                                        {memoryLimit}MB
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Final Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="create-problem-final-btn"
                            style={{ opacity: loading ? 0.7 : 1 }}>
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
        case 'MEDIUM': return '#d97706'
        case 'HARD': return '#ef4444'
        default: return '#64748b'
    }
}

const getDiffActiveStyle = (d) => {
    switch (d) {
        case 'EASY': return {
            color: '#10b981',
            background: 'rgba(16,185,129,0.08)',
            borderColor: 'rgba(16,185,129,0.25)'
        }
        case 'MEDIUM': return {
            color: '#d97706',
            background: 'rgba(245,158,11,0.08)',
            borderColor: 'rgba(245,158,11,0.25)'
        }
        case 'HARD': return {
            color: '#ef4444',
            background: 'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.25)'
        }
        default: return {}
    }
}