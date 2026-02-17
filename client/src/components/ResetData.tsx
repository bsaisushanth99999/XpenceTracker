import { useState } from 'react';

export default function ResetData() {
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
            <button
                className="header-reset-btn"
                onClick={() => setShowReset(true)}
                style={{}}
            >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ minWidth: '14px' }}>
                    <path d="M2 4h12M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v5M10 7v5M3 4l1 9a1 1 0 001 1h6a1 1 0 001-1l1-9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span>RESET ALL DATA</span>
            </button>

            {/* Confirmation modal */}
            {showReset && (
                <div className="modal-overlay" onClick={() => !resetting && setShowReset(false)}>
                    <div className="modal-box destructive" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon">🚨</div>
                        <h3>Dangerous Action</h3>
                        <p>You are about to <strong>permanently delete</strong> all your transactions, income, and goals. This action is <strong>irreversible</strong>.</p>
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
                                {resetting ? 'Erasing Everything...' : 'Yes, Delete All Data'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
