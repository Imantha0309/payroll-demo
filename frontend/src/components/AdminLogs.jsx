import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import MainCard from './Card/MainCard';
const API_URL = import.meta.env.VITE_API_URL;

const MODULE_BADGE = {
    'Employee':          { bg: '#dcfce7', color: '#166534' },
    'Parliament Member': { bg: '#dbeafe', color: '#1e40af' },
    'Application':       { bg: '#fef9c3', color: '#854d0e' },
    'Security':          { bg: '#fee2e2', color: '#991b1b' },
    'Organization':      { bg: '#f3e8ff', color: '#6b21a8' },
    'Settings':          { bg: '#e0f2fe', color: '#0369a1' },
};

function getModuleBadge(mod) {
    return MODULE_BADGE[mod] ?? { bg: '#f3f4f6', color: '#374151' };
}

// FORMAT TIMESTAMP - Human readable
function formatTimestamp(timestamp) {
    try {
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    } catch {
        return timestamp;
    }
}

const selectStyle = {
    padding:         '7px 12px',
    borderRadius:    '8px',
    border:          '1.5px solid #e5e7eb',
    fontSize:        '0.85rem',
    color:           '#374151',
    background:      '#fff',
    cursor:          'pointer',
    outline:         'none',
    boxShadow:       '0 1px 3px rgba(0,0,0,0.06)',
    transition:      'border-color 0.2s',
    appearance:      'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
    backgroundRepeat:   'no-repeat',
    backgroundPosition: 'right 10px center',
    paddingRight:       '32px',
    minWidth:           '150px',
};

const inputStyle = {
    padding:      '7px 12px',
    borderRadius: '8px',
    border:       '1.5px solid #e5e7eb',
    fontSize:     '0.85rem',
    color:        '#374151',
    background:   '#fff',
    outline:      'none',
    boxShadow:    '0 1px 3px rgba(0,0,0,0.06)',
    transition:   'border-color 0.2s',
    minWidth:     '200px',
};

// SKELETON LOADER COMPONENT
function SkeletonRow() {
    return (
        <tr>
            <td><div style={{height: '20px', background: '#e5e7eb', borderRadius: '4px'}}></div></td>
            <td><div style={{height: '20px', background: '#e5e7eb', borderRadius: '4px'}}></div></td>
            <td><div style={{height: '20px', background: '#e5e7eb', borderRadius: '4px'}}></div></td>
            <td><div style={{height: '20px', background: '#e5e7eb', borderRadius: '4px'}}></div></td>
            <td><div style={{height: '20px', background: '#e5e7eb', borderRadius: '4px'}}></div></td>
            <td><div style={{height: '20px', background: '#e5e7eb', borderRadius: '4px'}}></div></td>
        </tr>
    );
}

// ERROR BANNER COMPONENT
function ErrorBanner({ message, onClose }) {
    return (
        <div style={{
            padding: '12px 16px',
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            color: '#991b1b',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'slideDown 0.3s ease-out',
        }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <i className="bi bi-exclamation-circle-fill" style={{fontSize: '18px'}}></i>
                <span>{message}</span>
            </div>
            <button 
                onClick={onClose} 
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '18px',
                    color: '#991b1b',
                    padding: '0',
                }}
                aria-label="Close error"
            >
                ✕
            </button>
        </div>
    );
}

// SUCCESS BANNER COMPONENT
function SuccessBanner({ message, duration = 3000 }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!visible) return null;

    return (
        <div style={{
            padding: '12px 16px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            color: '#166534',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideDown 0.3s ease-out',
        }}>
            <i className="bi bi-check-circle-fill" style={{fontSize: '18px'}}></i>
            <span>{message}</span>
        </div>
    );
}

export default function AdminLogs() {
    // Load Bootstrap Icons CSS
    useEffect(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.0/font/bootstrap-icons.css';
        document.head.appendChild(link);
        
        return () => {
            // Clean up if component unmounts
            if (document.head.contains(link)) {
                document.head.removeChild(link);
            }
        };
    }, []);

    const [logs, setLogs]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState(null);
    const [success, setSuccess]       = useState(null);
    const [moduleFilter, setModule]   = useState('All');
    const [deptFilter, setDept]       = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy]         = useState('timestamp');
    const [sortOrder, setSortOrder]   = useState('desc');
    const logsPerPage = 20;

    // Derive unique departments from loaded logs
    const departments = useMemo(() => {
        const unique = [...new Set(logs.map((l) => l.department).filter((d) => d && d !== '—'))];
        return ['All', ...unique.sort()];
    }, [logs]);

    useEffect(() => {
        fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [moduleFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = {};
            if (moduleFilter !== 'All') params.module = moduleFilter;

            const response = await axios.get('http://127.0.0.1:8000/api/admin-logs', { params });
            setLogs(response.data);
            setDept('All');
            setCurrentPage(1);
            setSearchTerm('');
        } catch (error) {
            setError('Failed to load admin logs. Please try again later.');
            console.error('Error loading admin logs:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply all filters and sorting
    const filteredLogs = useMemo(() => {
        let filtered = logs;

        // Department filter
        if (deptFilter !== 'All') {
            filtered = filtered.filter((l) => l.department === deptFilter);
        }

        // Search filter (searches in username, action details, and performer name)
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter((l) =>
                (l.performed_by && l.performed_by.toLowerCase().includes(term)) ||
                (l.performed_by_username && l.performed_by_username.toLowerCase().includes(term)) ||
                (l.details && l.details.toLowerCase().includes(term)) ||
                (l.module && l.module.toLowerCase().includes(term))
            );
        }

        // Sorting
        filtered = [...filtered].sort((a, b) => {
            let aVal = a[sortBy];
            let bVal = b[sortBy];

            // Handle null/undefined values
            if (aVal == null) aVal = '';
            if (bVal == null) bVal = '';

            // Compare based on type
            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }
        });

        return filtered;
    }, [logs, deptFilter, searchTerm, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    const startIdx = (currentPage - 1) * logsPerPage;
    const paginatedLogs = filteredLogs.slice(startIdx, startIdx + logsPerPage);

    // Ensure current page is valid
    useEffect(() => {
        if (currentPage > totalPages && totalPages > 0) {
            setCurrentPage(totalPages);
        }
    }, [totalPages, currentPage]);

    // Export to CSV
    const exportToCSV = () => {
        try {
            const headers = ['SID', 'Timestamp', 'Module', 'Performed By', 'Username', 'Department', 'Action'];
            const csvContent = [
                headers.join(','),
                ...filteredLogs.map(log =>
                    [
                        `"${log.session_id}"`,
                        `"${log.timestamp}"`,
                        `"${log.module}"`,
                        `"${log.performed_by}"`,
                        `"${log.performed_by_username}"`,
                        `"${log.department}"`,
                        `"${(log.details || '').replace(/"/g, '""')}"`,
                    ].join(',')
                ),
            ].join('\n');

            const link = document.createElement('a');
            link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
            link.download = `admin-logs-${new Date().toISOString().split('T')[0]}.csv`;
            link.click();

            setSuccess('Logs exported successfully!');
        } catch (err) {
            setError('Failed to export logs.');
            console.error('Export error:', err);
        }
    };

    // Reset all filters
    const resetFilters = () => {
        setModule('All');
        setDept('All');
        setSearchTerm('');
        setCurrentPage(1);
    };

    const hasActiveFilters = moduleFilter !== 'All' || deptFilter !== 'All' || searchTerm.trim() !== '';

    // Function to toggle sort
    const toggleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Helper to show sort icon
    const SortIcon = ({ column }) => {
        if (sortBy !== column) {
            return <i className="bi bi-arrow-down-up ms-1" style={{opacity: 0.3, fontSize: '0.8rem'}}></i>;
        }
        return sortOrder === 'asc' 
            ? <i className="bi bi-sort-up ms-1" style={{fontSize: '0.8rem'}}></i>
            : <i className="bi bi-sort-down ms-1" style={{fontSize: '0.8rem'}}></i>;
    };

    return (
        <MainCard>
            <style>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .filters-container {
                        flex-direction: column !important;
                    }
                    .search-input {
                        width: 100% !important;
                    }
                    .table-responsive {
                        font-size: 0.8rem;
                    }
                }
            `}</style>

            {/* Error Banner */}
            {error && <ErrorBanner message={error} onClose={() => setError(null)} />}

            {/* Success Banner */}
            {success && <SuccessBanner message={success} />}

            {/* Header */}
            <div className="d-flex align-items-start justify-content-between mb-4 flex-wrap gap-3">
                <div>
                    <h5 className="mb-0 fw-semibold" style={{ color: '#111827' }}>Admin Activity Log</h5>
                    <small style={{ color: '#9ca3af' }}>
                        {filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''} 
                        {filteredLogs.length !== logs.length && ` (filtered from ${logs.length})`}
                    </small>
                </div>

                {/* Export Button */}
                <button
                    onClick={exportToCSV}
                    disabled={filteredLogs.length === 0}
                    style={{
                        padding: '7px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #d1d5db',
                        background: '#fff',
                        color: '#374151',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: filteredLogs.length === 0 ? 'not-allowed' : 'pointer',
                        opacity: filteredLogs.length === 0 ? 0.5 : 1,
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                    }}
                    onMouseEnter={(e) => {
                        if (filteredLogs.length > 0) {
                            e.target.style.background = '#f3f4f6';
                            e.target.style.borderColor = '#9ca3af';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.background = '#fff';
                        e.target.style.borderColor = '#d1d5db';
                    }}
                >
                    <i className="bi bi-download" style={{fontSize: '16px'}}></i>
                    Export CSV
                </button>
            </div>

            {/* Search Bar */}
            <div style={{marginBottom: '16px', position: 'relative'}}>
                <i className="bi bi-search" style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    pointerEvents: 'none',
                    fontSize: '18px',
                }}></i>
                <input
                    type="text"
                    placeholder="Search by username, action, or module..."
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                    }}
                    style={{
                        ...inputStyle,
                        width: '100%',
                        maxWidth: '100%',
                        paddingLeft: '40px',
                    }}
                />
            </div>

            {/* Filters pill bar */}
            <div style={{
                display:      'flex',
                gap:          '8px',
                alignItems:   'center',
                flexWrap:     'wrap',
                background:   '#f9fafb',
                border:       '1.5px solid #e5e7eb',
                borderRadius: '12px',
                padding:      '12px',
                marginBottom: '16px',
                className:    'filters-container',
            }}>
                <select style={selectStyle} value={moduleFilter} onChange={(e) => {
                    setModule(e.target.value);
                    setCurrentPage(1);
                }}>
                    <option value="All">All Modules</option>
                    <option value="Employee">Employee</option>
                    <option value="Parliament Member">Parliament Member</option>
                    <option value="Application">Application</option>
                    <option value="Organization">Organization</option>
                    <option value="Settings">Settings</option>
                    <option value="Security">Security</option>
                </select>

                <select style={selectStyle} value={deptFilter} onChange={(e) => {
                    setDept(e.target.value);
                    setCurrentPage(1);
                }}>
                    {departments.map((d) => (
                        <option key={d} value={d}>{d === 'All' ? 'All Departments' : d}</option>
                    ))}
                </select>

                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        style={{
                            padding:      '7px 12px',
                            borderRadius: '8px',
                            border:       '1.5px solid #fca5a5',
                            background:   '#fff1f2',
                            color:        '#e11d48',
                            fontSize:     '0.82rem',
                            fontWeight:   600,
                            cursor:       'pointer',
                            whiteSpace:   'nowrap',
                            display:      'flex',
                            alignItems:   'center',
                            gap:          '4px',
                        }}
                    >
                        <i className="bi bi-x-circle-fill" style={{fontSize: '16px'}}></i>
                        Reset Filters
                    </button>
                )}
            </div>

            {/* Table */}
            {loading ? (
                <div className="table-responsive">
                    <table className="table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>SID</th>
                                <th style={{ width: '130px' }}>Timestamp</th>
                                <th style={{ width: '150px', whiteSpace: 'nowrap' }}>Module</th>
                                <th>Performed By</th>
                                <th style={{ width: '160px' }}>Department</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
                        </tbody>
                    </table>
                </div>
            ) : (
                <>
                    <div className="table-responsive" style={{
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch',
                    }}>
                        <table className="table table-hover" style={{minWidth: '800px'}}>
                            <thead>
                                <tr style={{background: '#f9fafb'}}>
                                    <th style={{ width: '80px', cursor: 'pointer' }} onClick={() => toggleSort('session_id')}>
                                        SID <SortIcon column="session_id" />
                                    </th>
                                    <th style={{ width: '130px', cursor: 'pointer' }} onClick={() => toggleSort('timestamp')}>
                                        Timestamp <SortIcon column="timestamp" />
                                    </th>
                                    <th style={{ width: '150px', whiteSpace: 'nowrap' }}>
                                        Module
                                    </th>
                                    <th>
                                        Performed By
                                    </th>
                                    <th style={{ width: '160px' }}>
                                        Department
                                    </th>
                                    <th>
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedLogs.length > 0 ? (
                                    paginatedLogs.map((item) => {
                                        const badge = getModuleBadge(item.module);
                                        return (
                                            <tr key={item.id} style={{
                                                borderBottom: '1px solid #f3f4f6',
                                            }}>
                                                <td>
                                                    <span className="badge bg-secondary" style={{
                                                        fontSize: '0.75rem',
                                                        letterSpacing: '0.05em',
                                                    }} title={item.session_id}>
                                                        {item.session_id.substring(0, 8)}...
                                                    </span>
                                                </td>
                                                <td style={{fontSize: '0.9rem', color: '#6b7280'}}>
                                                    {formatTimestamp(item.timestamp)}
                                                </td>
                                                <td>
                                                    <span style={{
                                                        backgroundColor: badge.bg,
                                                        color:           badge.color,
                                                        padding:         '4px 12px',
                                                        borderRadius:    '12px',
                                                        fontSize:        '0.75rem',
                                                        fontWeight:      600,
                                                        whiteSpace:      'nowrap',
                                                    }}>
                                                        {item.module}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong style={{color: '#111827'}}>{item.performed_by}</strong>
                                                    <br />
                                                    <small className="text-muted">@{item.performed_by_username}</small>
                                                </td>
                                                <td style={{color: '#6b7280', fontSize: '0.9rem'}}>
                                                    {item.department || '—'}
                                                </td>
                                                <td style={{color: '#374151', fontSize: '0.9rem', maxWidth: '300px'}}>
                                                    <span title={item.details}>{item.details}</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center" style={{padding: '40px 0', color: '#9ca3af'}}>
                                            <div style={{fontSize: '3rem', marginBottom: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                                                <i className="bi bi-search" style={{fontSize: '3rem'}}></i>
                                            </div>
                                            <strong>No logs found</strong>
                                            <p style={{margin: '8px 0 0 0', fontSize: '0.9rem'}}>
                                                Try adjusting your filters or search terms
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '20px',
                            paddingTop: '16px',
                            borderTop: '1px solid #e5e7eb',
                            flexWrap: 'wrap',
                            gap: '12px',
                        }}>
                            <small style={{color: '#6b7280'}}>
                                Showing {startIdx + 1} to {Math.min(startIdx + logsPerPage, filteredLogs.length)} of {filteredLogs.length}
                            </small>

                            <div style={{display: 'flex', gap: '4px', flexWrap: 'wrap'}}>
                                <button
                                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    style={{
                                        padding: '6px 10px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        background: currentPage === 1 ? '#f3f4f6' : '#fff',
                                        color: currentPage === 1 ? '#9ca3af' : '#374151',
                                        cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    <i className="bi bi-chevron-left" style={{fontSize: '16px'}}></i>
                                    Prev
                                </button>

                                {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        style={{
                                            padding: '6px 10px',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px',
                                            background: currentPage === page ? '#3b82f6' : '#fff',
                                            color: currentPage === page ? '#fff' : '#374151',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: currentPage === page ? 600 : 500,
                                            minWidth: '32px',
                                        }}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    style={{
                                        padding: '6px 10px',
                                        border: '1px solid #d1d5db',
                                        borderRadius: '4px',
                                        background: currentPage === totalPages ? '#f3f4f6' : '#fff',
                                        color: currentPage === totalPages ? '#9ca3af' : '#374151',
                                        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                                        fontSize: '0.85rem',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                    }}
                                >
                                    Next
                                    <i className="bi bi-chevron-right" style={{fontSize: '16px'}}></i>
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </MainCard>
    );
}