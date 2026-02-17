import { useState, useEffect } from 'react';
import { MonthlyIncome } from '../types';

interface IncomeSetupProps {
    onComplete: () => void;
    onCancel?: () => void;
    month?: string;
}

export default function IncomeSetup({ onComplete, onCancel, month }: IncomeSetupProps) {
    const [amount, setAmount] = useState('');
    const [saving, setSaving] = useState(false);

    const targetMonth = month || new Date().toISOString().slice(0, 7);
    const displayMonth = new Date(targetMonth + '-01').toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = parseFloat(amount);
        if (isNaN(parsed) || parsed < 0) return;

        setSaving(true);
        try {
            await fetch('/api/income', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: parsed, month: targetMonth }),
            });
            onComplete();
        } catch (err) {
            console.error('Failed to save income', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="income-overlay">
            <div className="income-modal">
                <div className="income-modal-icon">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                        <rect x="2" y="6" width="28" height="20" rx="4" stroke="currentColor" strokeWidth="2" />
                        <path d="M2 12h28" stroke="currentColor" strokeWidth="2" />
                        <circle cx="16" cy="20" r="3" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                </div>
                <h2>{month ? 'Edit Income' : 'Set Monthly Income'}</h2>
                <p className="income-modal-desc">
                    Enter your income for <strong>{displayMonth}</strong>.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="income-input-wrapper">
                        <span className="income-currency">₹</span>
                        <input
                            type="number"
                            placeholder="0"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0"
                            step="any"
                            autoFocus
                            required
                        />
                    </div>
                    <div className="income-modal-actions">
                        {onCancel && (
                            <button type="button" className="btn-secondary" onClick={onCancel} disabled={saving}>
                                Cancel
                            </button>
                        )}
                        <button type="submit" className="btn-primary income-submit" disabled={saving}>
                            {saving ? 'Saving…' : 'Save Income'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
