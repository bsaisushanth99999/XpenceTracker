import { useState, useEffect } from 'react';
import { Goal } from '../types';

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Goals() {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState('');
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editName, setEditName] = useState('');
    const [editAmount, setEditAmount] = useState('');

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
            body: JSON.stringify({ name: name.trim(), target_amount: parseFloat(targetAmount) }),
        });
        setName('');
        setTargetAmount('');
        fetchGoals();
    };

    const handleDelete = async (id: number) => {
        await fetch(`/api/goals/${id}`, { method: 'DELETE' });
        fetchGoals();
    };

    const startEdit = (goal: Goal) => {
        setEditingId(goal.id);
        setEditName(goal.name);
        setEditAmount(String(goal.target_amount));
    };

    const handleUpdate = async (id: number) => {
        await fetch(`/api/goals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: editName.trim(), target_amount: parseFloat(editAmount) }),
        });
        setEditingId(null);
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
                    placeholder="Target savings amount"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    min="0"
                    step="any"
                    required
                />
                <button type="submit" className="btn-primary">Add Goal</button>
            </form>

            {goals.length === 0 ? (
                <div className="empty-state">
                    <p>No goals yet. Add one above.</p>
                </div>
            ) : (
                <div className="goals-list">
                    {goals.map((goal) => (
                        <div key={goal.id} className="goal-card">
                            {editingId === goal.id ? (
                                <div className="goal-edit">
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(e.target.value)}
                                        min="0"
                                        step="any"
                                    />
                                    <div className="goal-actions">
                                        <button className="btn-small" onClick={() => handleUpdate(goal.id)}>Save</button>
                                        <button className="btn-small secondary" onClick={() => setEditingId(null)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="goal-info">
                                        <span className="goal-name">{goal.name}</span>
                                        <span className="goal-target">Target: {fmt(goal.target_amount)}</span>
                                    </div>
                                    <div className="goal-actions">
                                        <button className="btn-small" onClick={() => startEdit(goal)}>Edit</button>
                                        <button className="btn-small danger" onClick={() => handleDelete(goal.id)}>Delete</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
