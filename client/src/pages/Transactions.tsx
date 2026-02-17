import { useState, useMemo } from 'react';
import FilterBar from '../components/FilterBar';
import { useTransactions } from '../hooks/useTransactions';
import { Transaction } from '../types';

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n);

function groupTransactionsByMonth(txns: Transaction[]): Record<string, Transaction[]> {
    const groups: Record<string, Transaction[]> = {};
    for (const txn of txns) {
        const monthKey = txn.date.slice(0, 7); // YYYY-MM
        if (!groups[monthKey]) {
            groups[monthKey] = [];
        }
        groups[monthKey].push(txn);
    }
    return groups;
}

export default function Transactions() {
    const { transactions, loading } = useTransactions();

    // Sort by date desc always for grouping purposes, then by ID desc
    const sorted = useMemo(() => {
        return [...transactions].sort((a, b) => {
            const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
            if (dateDiff !== 0) return dateDiff;
            return b.id - a.id;
        });
    }, [transactions]);

    const groups = useMemo(() => groupTransactionsByMonth(sorted), [sorted]);
    const monthKeys = Object.keys(groups).sort().reverse(); // Show latest month first

    return (
        <div className="page">
            <div className="page-header">
                <h1>Transactions</h1>
                <span className="record-count">{transactions.length} records</span>
            </div>

            <FilterBar />

            {loading ? (
                <div className="loading">Loading transactions…</div>
            ) : transactions.length === 0 ? (
                <div className="empty-state">
                    <p>No transactions found for the current filters.</p>
                    <p className="hint">Upload a CSV file to get started.</p>
                </div>
            ) : (
                <div className="txn-list">
                    {monthKeys.map((monthKey) => {
                        const group = groups[monthKey];
                        const [y, m] = monthKey.split('-').map(Number);
                        const monthLabel = new Date(y, m - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

                        // Calculate monthly totals
                        const income = group.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
                        const expenses = group.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

                        return (
                            <div key={monthKey} className="month-group">
                                <div className="month-header">
                                    <h3>{monthLabel}</h3>
                                    <div className="month-summary">
                                        {income > 0 && <span className="income">+{fmt(income)}</span>}
                                        <span className="expense">−{fmt(expenses)}</span>
                                    </div>
                                </div>
                                <div className="table-wrapper">
                                    <table className="txn-table">
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Amount</th>
                                                <th>Category</th>
                                                <th>Description</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {group.map((txn) => (
                                                <tr key={txn.id} data-type={txn.type}>
                                                    <td className="col-date">
                                                        {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </td>
                                                    <td className={`col-amount ${txn.type}`}>
                                                        {txn.type === 'expense' ? '−' : '+'}
                                                        {fmt(txn.amount)}
                                                    </td>
                                                    <td><span className="category-tag">{txn.category}</span></td>
                                                    <td className="col-desc">
                                                        <div className="desc-main">{txn.description}</div>
                                                        {txn.notes && <div className="desc-notes">{txn.notes}</div>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
