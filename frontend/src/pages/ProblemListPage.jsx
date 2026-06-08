import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { problemService } from '../services/problemService'
import {
    Search, Filter, CheckCircle2, Circle,
    ChevronLeft, ChevronRight, Code2
} from 'lucide-react'

export default function ProblemListPage() {
    const [problems, setProblems] = useState([])
    const [loading, setLoading] = useState(true)
    const [keyword, setKeyword] = useState('')
    const [difficulty, setDifficulty] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [searchInput, setSearchInput] = useState('')

    useEffect(() => {
        fetchProblems()
    }, [page, difficulty, keyword])

    const fetchProblems = async () => {
        setLoading(true)
        try {
            const response = await problemService.getProblems(
                page, 20, difficulty, keyword)
            setProblems(response.data.content || [])
            setTotalPages(response.data.totalPages || 0)
            setTotalElements(response.data.totalElements || 0)
        } catch (error) {
            console.error('Failed to fetch problems:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        setKeyword(searchInput)
        setPage(0)
    }

    const handleDifficulty = (diff) => {
        setDifficulty(diff === difficulty ? '' : diff)
        setPage(0)
    }

    const getDifficultyStyle = (diff) => {
        switch (diff) {
            case 'EASY': return { color: '#10b981', background: 'rgba(16,185,129,0.1)' }
            case 'MEDIUM': return { color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }
            case 'HARD': return { color: '#ef4444', background: 'rgba(239,68,68,0.1)' }
            default: return {}
        }
    }

    const getAcceptanceColor = (rate) => {
        if (rate >= 60) return '#10b981'
        if (rate >= 40) return '#f59e0b'
        return '#ef4444'
    }

    return (
        <div style={styles.page}>
            <div style={styles.container}>

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={styles.title}>Problems</h1>
                        <p style={styles.subtitle}>
                            {totalElements} problems available
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div style={styles.filters}>

                    {/* Search */}
                    <form onSubmit={handleSearch} style={styles.searchForm}>
                        <div style={styles.searchWrapper}>
                            <Search size={16} color="#6b7280"
                                style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search problems..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>
                        <button type="submit" style={styles.searchBtn}>
                            Search
                        </button>
                    </form>

                    {/* Difficulty Filter */}
                    <div style={styles.difficultyFilters}>
                        <span style={styles.filterLabel}>
                            <Filter size={14} />
                            Difficulty:
                        </span>
                        {['EASY', 'MEDIUM', 'HARD'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => handleDifficulty(diff)}
                                style={{
                                    ...styles.filterBtn,
                                    ...(difficulty === diff
                                        ? getDifficultyStyle(diff)
                                        : {}),
                                    border: `1px solid ${difficulty === diff
                                        ? getDifficultyStyle(diff).color
                                        : '#1e2d45'}`
                                }}>
                                {diff.charAt(0) + diff.slice(1).toLowerCase()}
                            </button>
                        ))}
                        {(difficulty || keyword) && (
                            <button
                                onClick={() => {
                                    setDifficulty('')
                                    setKeyword('')
                                    setSearchInput('')
                                    setPage(0)
                                }}
                                style={styles.clearBtn}>
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div style={styles.tableCard}>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={styles.th}>#</th>
                                <th style={styles.th}>Title</th>
                                <th style={styles.th}>Difficulty</th>
                                <th style={styles.th}>Tags</th>
                                <th style={styles.th}>Acceptance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <td key={j} style={styles.td}>
                                                <div style={{
                                                    ...styles.skeleton,
                                                    width: j === 1 ? '60%' : '40%',
                                                    height: '16px'
                                                }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : problems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={styles.emptyTd}>
                                        <div style={styles.empty}>
                                            <Code2 size={48} color="#374151" />
                                            <p style={styles.emptyText}>
                                                No problems found
                                            </p>
                                            <p style={styles.emptySubtext}>
                                                Try adjusting your filters
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                problems.map((problem, index) => (
                                    <tr key={problem.id} style={styles.row}>
                                        <td style={styles.td}>
                                            <span style={styles.problemNum}>
                                                {page * 20 + index + 1}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <Link
                                                to={`/problems/${problem.id}`}
                                                style={styles.problemLink}>
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.diffBadge,
                                                ...getDifficultyStyle(problem.difficulty)
                                            }}>
                                                {problem.difficulty.charAt(0) +
                                                    problem.difficulty.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={styles.tags}>
                                                {problem.tags?.slice(0, 2).map(tag => (
                                                    <span key={tag} style={styles.tag}>
                                                        {tag}
                                                    </span>
                                                ))}
                                                {problem.tags?.length > 2 && (
                                                    <span style={styles.moreTag}>
                                                        +{problem.tags.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.acceptance,
                                                color: getAcceptanceColor(
                                                    problem.acceptanceRate)
                                            }}>
                                                {problem.acceptanceRate?.toFixed(1)}%
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={styles.pagination}>
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            style={{
                                ...styles.pageBtn,
                                opacity: page === 0 ? 0.4 : 1
                            }}>
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <span style={styles.pageInfo}>
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            style={{
                                ...styles.pageBtn,
                                opacity: page === totalPages - 1 ? 0.4 : 1
                            }}>
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

const styles = {
    page: {
        minHeight: 'calc(100vh - 64px)',
        padding: '32px 0',
        background: '#0a0e1a',
    },
    container: {
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 24px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '800',
        color: '#f9fafb',
        letterSpacing: '-0.5px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#6b7280',
        marginTop: '4px',
    },
    filters: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        marginBottom: '24px',
    },
    searchForm: {
        display: 'flex',
        gap: '12px',
    },
    searchWrapper: {
        position: 'relative',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
    },
    searchIcon: {
        position: 'absolute',
        left: '14px',
        pointerEvents: 'none',
    },
    searchInput: {
        width: '100%',
        padding: '11px 14px 11px 40px',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '10px',
        color: '#f9fafb',
        fontSize: '14px',
    },
    searchBtn: {
        padding: '11px 24px',
        background: '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
    },
    difficultyFilters: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        flexWrap: 'wrap',
    },
    filterLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        color: '#6b7280',
        fontWeight: '500',
    },
    filterBtn: {
        padding: '6px 16px',
        background: 'transparent',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        color: '#9ca3af',
        transition: 'all 0.2s',
    },
    clearBtn: {
        padding: '6px 16px',
        background: 'transparent',
        border: '1px solid #374151',
        borderRadius: '20px',
        fontSize: '13px',
        color: '#6b7280',
        cursor: 'pointer',
        marginLeft: '4px',
    },
    tableCard: {
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '14px',
        overflow: 'hidden',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
    },
    th: {
        textAlign: 'left',
        padding: '14px 20px',
        fontSize: '12px',
        fontWeight: '600',
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        borderBottom: '1px solid #1e2d45',
        background: '#0f172a',
    },
    td: {
        padding: '16px 20px',
        borderBottom: '1px solid #1e2d45',
        fontSize: '14px',
    },
    row: {
        transition: 'background 0.15s',
        cursor: 'pointer',
    },
    problemNum: {
        color: '#4b5563',
        fontSize: '13px',
        fontWeight: '500',
    },
    problemLink: {
        color: '#f9fafb',
        fontWeight: '500',
        textDecoration: 'none',
        transition: 'color 0.15s',
    },
    diffBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
    },
    tags: {
        display: 'flex',
        gap: '6px',
        flexWrap: 'wrap',
    },
    tag: {
        padding: '3px 10px',
        background: '#1a2235',
        border: '1px solid #1e2d45',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#9ca3af',
    },
    moreTag: {
        padding: '3px 8px',
        background: '#1a2235',
        borderRadius: '20px',
        fontSize: '12px',
        color: '#6b7280',
    },
    acceptance: {
        fontSize: '13px',
        fontWeight: '600',
    },
    skeleton: {
        background: 'linear-gradient(90deg, #1a2235 25%, #1e2d45 50%, #1a2235 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        borderRadius: '4px',
    },
    emptyTd: {
        padding: '60px 20px',
        textAlign: 'center',
    },
    empty: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
    },
    emptyText: {
        fontSize: '18px',
        fontWeight: '600',
        color: '#374151',
    },
    emptySubtext: {
        fontSize: '14px',
        color: '#4b5563',
    },
    pagination: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        marginTop: '24px',
    },
    pageBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '8px 16px',
        background: '#111827',
        border: '1px solid #1e2d45',
        borderRadius: '8px',
        color: '#9ca3af',
        fontSize: '14px',
        fontWeight: '500',
        cursor: 'pointer',
    },
    pageInfo: {
        fontSize: '14px',
        color: '#6b7280',
    },
}