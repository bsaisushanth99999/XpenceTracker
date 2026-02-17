import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [showReset, setShowReset] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleReset = async () => {
        setResetting(true);
        try {
            const res = await fetch('/api/transactions', { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to reset');
            window.location.reload();
        } catch (err) {
            alert('Reset failed. Please try again.');
            setResetting(false);
            setShowReset(false);
        }
    };

    return (
        <>
            <div className="theme-toggle-fixed">
                <button
                    className="top-reset-btn"
                    onClick={() => setShowReset(true)}
                    title="Reset All Data"
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>Reset</span>
                </button>

                <div className="toggle-separator" />

                <button
                    className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                    onClick={() => setTheme('system')}
                    title="System theme"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                        <path d="M8 21h8M12 17v4" />
                    </svg>
                </button>
                <button
                    className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                    onClick={() => setTheme('light')}
                    title="Light mode"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                </button>
                <button
                    className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                    onClick={() => setTheme('dark')}
                    title="Dark mode"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                </button>
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
