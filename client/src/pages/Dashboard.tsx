import { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import { SpendingByCategory, IncomeVsExpenses, SpendingOverTime } from '../components/Charts';
import { useSummary, useCategoryBreakdown, useTimeSeries } from '../hooks/useTransactions';
import { useFilters } from '../context/FilterContext';
import IncomeSetup from '../components/IncomeSetup';

const fmt = (n: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
    const { filters } = useFilters();
    const { summary, loading } = useSummary();
    const categoryData = useCategoryBreakdown();
    const timeData = useTimeSeries();

    const [monthlyIncome, setMonthlyIncome] = useState<number | null>(null);
    const [showIncomeSetup, setShowIncomeSetup] = useState(false);
    const [incomeLoading, setIncomeLoading] = useState(true);

    // Fetch stored monthly income
    const fetchMonthlyIncome = async () => {
        setIncomeLoading(true);
        try {
            // If "all" selected, we might want to sum all incomes?
            // Or just restrict income setup to current month.
            // For now, if a specific month is selected, fetch that month's income.
            // If "all" is selected, we can't really set a single "Monthly Income".
            // Let's fallback to transaction income for "all".

            let targetMonth = filters.month;
            if (targetMonth === 'all') {
                setMonthlyIncome(null); // Will fallback to summary.totalIncome
                setShowIncomeSetup(false);
            } else {
                const res = await fetch(`/api/income/${targetMonth}`);
                const data = await res.json();
                if (data) {
                    setMonthlyIncome(data.amount);
                    setShowIncomeSetup(false);
                } else {
                    setMonthlyIncome(null);
                    // Only show setup if it's the CURRENT month and we have no income set
                    const currentMonth = new Date().toISOString().slice(0, 7);
                    if (targetMonth === currentMonth) {
                        setShowIncomeSetup(true);
                    }
                }
            }
        } catch (err) {
            console.error('Failed to fetch monthly income', err);
        } finally {
            setIncomeLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthlyIncome();
    }, [filters.month]);

    // Determine which income to show
    // If specific month & stored income exists -> use stored income
    // Else -> use transaction income sum
    const displayedIncome = (filters.month !== 'all' && monthlyIncome !== null)
        ? monthlyIncome
        : summary.totalIncome;

    // Balance = Income - Expenses
    // If using stored income, balance reflects that.
    const displayedBalance = displayedIncome - summary.totalExpenses;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Dashboard</h1>
            </div>

            <FilterBar />

            <div className="summary-row">
                <div className="summary-item income">
                    <span className="summary-label">
                        {filters.month !== 'all' && monthlyIncome !== null ? 'Budgeted Income' : 'Total Income'}
                    </span>
                    <span className="summary-value">
                        {loading || incomeLoading ? '—' : fmt(displayedIncome)}
                    </span>
                </div>
                <div className="summary-item expense">
                    <span className="summary-label">Total Expenses</span>
                    <span className="summary-value">{loading ? '—' : fmt(summary.totalExpenses)}</span>
                </div>
                <div className="summary-item balance">
                    <span className="summary-label">Balance</span>
                    <span className="summary-value" data-negative={displayedBalance < 0}>
                        {loading || incomeLoading ? '—' : fmt(displayedBalance)}
                    </span>
                </div>
            </div>

            <div className="charts-grid">
                <SpendingByCategory data={categoryData} />
                {/* Pass displayedIncome so the comparison chart uses the budget if set */}
                <IncomeVsExpenses totalIncome={displayedIncome} totalExpenses={summary.totalExpenses} />
                <SpendingOverTime data={timeData} />
            </div>

            {showIncomeSetup && (
                <IncomeSetup onComplete={() => fetchMonthlyIncome()} />
            )}
        </div>
    );
}
