import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    AreaChart, Area, Legend,
} from 'recharts';
import { CategoryBreakdown, TimeSeriesPoint } from '../types';

const COLORS = [
    '#6366f1', '#f43f5e', '#10b981', '#f59e0b', '#8b5cf6',
    '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#64748b',
];

const formatCurrency = (val: number | undefined | null) => {
    if (val == null) return '';
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(val);
};

interface CategoryChartProps {
    data: CategoryBreakdown[];
}

export function SpendingByCategory({ data }: CategoryChartProps) {
    const expenseData = data.filter((d) => d.type === 'expense');
    if (expenseData.length === 0) return <div className="chart-empty">No expense data for selected filters</div>;

    return (
        <div className="chart-container">
            <h3 className="chart-title">Spending by Category</h3>
            <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                    <Pie
                        data={expenseData}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={50}
                        paddingAngle={2}
                        stroke="none"
                    >
                        {expenseData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(val: any) => formatCurrency(val)}
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
                    />
                    <Legend
                        wrapperStyle={{ fontSize: '12px' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}

interface ComparisonChartProps {
    totalIncome: number;
    totalExpenses: number;
}

export function IncomeVsExpenses({ totalIncome, totalExpenses }: ComparisonChartProps) {
    const data = [
        { name: 'Income', amount: totalIncome },
        { name: 'Expenses', amount: totalExpenses },
    ];
    if (totalIncome === 0 && totalExpenses === 0) return <div className="chart-empty">No data for selected filters</div>;

    return (
        <div className="chart-container">
            <h3 className="chart-title">Income vs Expenses</h3>
            <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data} barSize={48}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip
                        formatter={(val: any) => formatCurrency(val)}
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                        <Cell fill="#10b981" />
                        <Cell fill="#f43f5e" />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}

interface TimeChartProps {
    data: TimeSeriesPoint[];
}

export function SpendingOverTime({ data }: TimeChartProps) {
    if (data.length === 0) return <div className="chart-empty">No data for selected filters</div>;

    return (
        <div className="chart-container">
            <h3 className="chart-title">Spending Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                        dataKey="date"
                        tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                        tickFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip
                        formatter={(val: any) => formatCurrency(val)}
                        labelFormatter={(d) => new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                        contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '13px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b98133" strokeWidth={2} name="Income" />
                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" fill="#f43f5e33" strokeWidth={2} name="Expenses" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
