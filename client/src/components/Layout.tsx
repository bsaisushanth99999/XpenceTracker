import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import CsvUpload from './CsvUpload';
import ParticleSwarm from './ParticleSwarm';
import ThemeToggle from './ThemeToggle';

export default function Layout() {
    const [showReset, setShowReset] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleReset = async () => {
        setResetting(true);
        try {
            const res = await fetch('/api/transactions', { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to reset');
            // Reload the page for a clean slate
            window.location.reload();
        } catch (err) {
            alert('Reset failed. Please try again.');
            setResetting(false);
            setShowReset(false);
        }
    };

    return (
        <>
            <ParticleSwarm />
            <ThemeToggle />
            <div className="app-layout">
                <nav className="sidebar">
                    <div className="sidebar-brand">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="1" y="1" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M5 14V9M8 14V6M11 14V10M14 14V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>ExpenseTracker</span>
                    </div>
                    <div className="sidebar-links">
                        <NavLink to="/" end>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 8l6-6 6 6M4 7v6h3v-3h2v3h3V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Dashboard
                        </NavLink>
                        <NavLink to="/transactions">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                            Transactions
                        </NavLink>
                        <NavLink to="/goals">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                                <circle cx="8" cy="8" r="0.8" fill="currentColor" />
                            </svg>
                            Goals
                        </NavLink>
                    </div>
                    <div className="sidebar-footer">
                        <CsvUpload />
                        <button
                            className="reset-btn"
                            onClick={() => setShowReset(true)}
                        >
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Reset All Data
                        </button>
                    </div>
                </nav>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>

            {/* Confirmation modal */}
            {showReset && (
                <div className="modal-overlay" onClick={() => !resetting && setShowReset(false)}>
                    <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon">⚠️</div>
                        <h3>Reset All Data?</h3>
                        <p>This will permanently erase <strong>all transactions</strong>, <strong>income records</strong>, and <strong>goals</strong>. This cannot be undone.</p>
                        <div className="modal-actions">
                            <button
                                className="btn-secondary"
                                onClick={() => setShowReset(false)}
                                disabled={resetting}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn-danger"
                                onClick={handleReset}
                                disabled={resetting}
                            >
                                {resetting ? 'Erasing...' : 'Yes, Erase Everything'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
