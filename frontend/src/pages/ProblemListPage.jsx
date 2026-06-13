import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { problemService } from '../services/problemService'
import {
    Search, Filter, ChevronLeft, ChevronRight, Code2
} from 'lucide-react'
import './ProblemListPage.css'

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

    const getAcceptanceColor = (rate) => {
        if (rate >= 60) return '#10b981'
        if (rate >= 40) return '#d97706'
        return '#ef4444'
    }

    return (
        <div className="problems-page">
            {/* Glowing Blur Background Blobs */}
            <div className="blob blob-pink"></div>
            <div className="blob blob-mint"></div>
            <div className="blob blob-blue"></div>

            <div className="problems-page-container">
                {/* Header */}
                <div className="problems-header">
                    <div>
                        <h1 className="problems-title">Problems</h1>
                        <p className="problems-subtitle">
                            {totalElements} problems available
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="problems-filters">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="search-form">
                        <div className="search-wrapper">
                            <Search size={16} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search problems..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="search-input"
                            />
                        </div>
                        <button type="submit" className="search-btn">
                            Search
                        </button>
                    </form>

                    {/* Difficulty Filter */}
                    <div className="difficulty-filters">
                        <span className="filter-label">
                            <Filter size={14} />
                            Difficulty:
                        </span>
                        {['EASY', 'MEDIUM', 'HARD'].map(diff => (
                            <button
                                key={diff}
                                onClick={() => handleDifficulty(diff)}
                                className={`filter-btn${difficulty === diff ? ` active-${diff.toLowerCase()}` : ''}`}
                            >
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
                                className="clear-btn">
                                Clear Filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="table-card">
                    <table className="problems-table">
                        <thead>
                            <tr>
                                <th className="problems-th">#</th>
                                <th className="problems-th">Title</th>
                                <th className="problems-th">Difficulty</th>
                                <th className="problems-th">Tags</th>
                                <th className="problems-th">Acceptance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="problems-row">
                                        {Array.from({ length: 5 }).map((_, j) => (
                                            <td key={j} className="problems-td">
                                                <div 
                                                    className="problems-skeleton" 
                                                    style={{
                                                        width: j === 1 ? '60%' : '40%',
                                                        height: '16px'
                                                    }} 
                                                />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : problems.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="problems-empty-td">
                                        <div className="problems-empty">
                                            <Code2 size={48} color="#94a3b8" />
                                            <p className="problems-empty-text">
                                                No problems found
                                            </p>
                                            <p className="problems-empty-subtext">
                                                Try adjusting your filters
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                problems.map((problem, index) => (
                                    <tr key={problem.id} className="problems-row">
                                        <td className="problems-td">
                                            <span className="problem-num">
                                                {page * 20 + index + 1}
                                            </span>
                                        </td>
                                        <td className="problems-td">
                                            <Link
                                                to={`/problems/${problem.id}`}
                                                className="problem-link">
                                                {problem.title}
                                            </Link>
                                        </td>
                                        <td className="problems-td">
                                            <span className={`diff-badge ${problem.difficulty.toLowerCase()}`}>
                                                {problem.difficulty.charAt(0) +
                                                    problem.difficulty.slice(1).toLowerCase()}
                                            </span>
                                        </td>
                                        <td className="problems-td">
                                            <div className="problem-tags">
                                                {problem.tags?.slice(0, 2).map(tag => (
                                                    <span key={tag} className="problem-tag">
                                                        {tag}
                                                    </span>
                                                ))}
                                                {problem.tags?.length > 2 && (
                                                    <span className="problem-more-tag">
                                                        +{problem.tags.length - 2}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="problems-td">
                                            <span 
                                                className="problem-acceptance"
                                                style={{
                                                    color: getAcceptanceColor(problem.acceptanceRate)
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
                    <div className="problems-pagination">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="problems-page-btn"
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <span className="problems-page-info">
                            Page {page + 1} of {totalPages}
                        </span>
                        <button
                            onClick={() =>
                                setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="problems-page-btn"
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}