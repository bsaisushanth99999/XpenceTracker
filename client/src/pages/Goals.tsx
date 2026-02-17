import { useState, useEffect } from 'react';
import { Goal } from '../types';

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Goals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [savedAmount, setSavedAmount] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editSaved, setEditSaved] = useState('');
    const [addSavingsId, setAddSavingsId] = useState<number | null>(null);
    const [savingsToAdd, setSavingsToAdd] = useState('');

    const fetchGoals = async () => {
        const res = await fetch('/api/goals');
        setGoals(await res.json());
    };

    useEffect(() => { fetchGoals(); }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !targetAmount) return;
        await fetch('/api/goals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name.trim(),
                target_amount: parseFloat(targetAmount),
                saved_amount: parseFloat(savedAmount || '0')
            }),
        });
        setName('');
        setTargetAmount('');
        setSavedAmount('');
        fetchGoals();
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;
        await fetch(`/api/goals/${id}`, { method: 'DELETE' });
        fetchGoals();
    };

    const startEdit = (goal: Goal) => {
        setEditingId(goal.id);
        setEditName(goal.name);
        setEditAmount(String(goal.target_amount));
        setEditSaved(String(goal.saved_amount));
    };

    const handleUpdate = async (id: number) => {
        await fetch(`/api/goals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: editName.trim(),
                target_amount: parseFloat(editAmount),
                saved_amount: parseFloat(editSaved)
            }),
        });
        setEditingId(null);
        fetchGoals();
    };

    const handleQuickAddSavings = async (goal: Goal) => {
        const amountToAdd = parseFloat(savingsToAdd);
        if (isNaN(amountToAdd)) return;

        await fetch(`/api/goals/${goal.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                saved_amount: goal.saved_amount + amountToAdd
            }),
        });
        setAddSavingsId(null);
        setSavingsToAdd('');
        fetchGoals();
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>Goals</h1>
            </div>

            <form className="goal-form" onSubmit={handleAdd}>
                <input
                    type="text"
                    placeholder="Goal name (e.g., Buy a car)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Target amount"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    min="0"
                    step="any"
                    required
                />
                <input
                    type="number"
                    placeholder="Initial savings (optional)"
                    value={savedAmount}
                    onChange={(e) => setSavedAmount(e.target.value)}
                    min="0"
                    step="any"
                />
                <button type="submit" className="btn-primary">Add Goal</button>
            </form>

            {goals.length === 0 ? (
                <div className="empty-state">
                    <p>No goals yet. Add one above.</p>
                </div>
            ) : (
                <div className="goals-list">
                    {goals.map((goal) => {
                        const progress = Math.min((goal.saved_amount / goal.target_amount) * 100, 100);
                        const isCompleted = progress >= 100;

                        return (
                            <div key={goal.id} className={`goal-card ${isCompleted ? 'completed' : ''}`}>
                                {editingId === goal.id ? (
                                    <div className="goal-edit">
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                            />
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <input
                                                    type="number"
                                                    value={editAmount}
                                                    onChange={(e) => setEditAmount(e.target.value)}
                                                    placeholder="Target"
                                                />
                                                <input
                                                    type="number"
                                                    value={editSaved}
                                                    onChange={(e) => setEditSaved(e.target.value)}
                                                    placeholder="Saved"
                                                />
                                            </div>
                                        </div>
                                        <div className="goal-actions">
                                            <button className="btn-small" onClick={() => handleUpdate(goal.id)}>Save</button>
                                            <button className="btn-small secondary" onClick={() => setEditingId(null)}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                                            <div className="goal-info">
                                                <span className="goal-name">{goal.name}</span>
                                                <span className="goal-target">Target: {fmt(goal.target_amount)}</span>
                                            </div>
                                            <div className="goal-actions">
                                                <button className="btn-small" onClick={() => setAddSavingsId(addSavingsId === goal.id ? null : goal.id)}>
                                                    Add Savings
                                                </button>
                                                <button className="btn-small" onClick={() => startEdit(goal)}>Edit</button>
                                                <button className="btn-small danger" onClick={() => handleDelete(goal.id)}>Delete</button>
                                            </div>
                                        </div>

                                        <div className="goal-progress-container">
                                            <div className="goal-progress-bar">
                                                <div className="goal-progress-fill" style={{ width: `${progress}%` }}></div>
                                            </div>
                                            <div className="goal-progress-stats">
                                                <span>{fmt(goal.saved_amount)} saved</span>
                                                <span className="progress-pct">{Math.round(progress)}%</span>
                                            </div>
                                        </div>

                                        {addSavingsId === goal.id && (
                                            <div className="goal-savings-input">
                                                <input
                                                    type="number"
                                                    placeholder="Amount to add"
                                                    value={savingsToAdd}
                                                    onChange={(e) => setSavingsToAdd(e.target.value)}
                                                    autoFocus
                                                />
                                                <button className="btn-primary" onClick={() => handleQuickAddSavings(goal)}>Confirm</button>
                                                <button className="btn-secondary" onClick={() => setAddSavingsId(null)}>Cancel</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
