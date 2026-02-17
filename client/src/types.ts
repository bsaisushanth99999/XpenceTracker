export interface Transaction {
    id: number;
    date: string;
    amount: number;
    category: string;
    description: string;
    notes: string | null;
    type: 'income' | 'expense';
    fingerprint: string;
    created_at: string;
}

export interface FilterState {
    month: string; // 'YYYY-MM' or 'all'
    categories: string[];
}

export interface TransactionSummary {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
}

export interface CategoryBreakdown {
    category: string;
    total: number;
    type: string;
}

export interface TimeSeriesPoint {
    date: string;
    income: number;
    expenses: number;
}

export interface Goal {
    id: number;
    name: string;
    target_amount: number;
    saved_amount: number;
    created_at: string;
}

export interface UploadResult {
    rowsProcessed: number;
    rowsInserted: number;
    duplicatesSkipped: number;
}

export interface MonthlyIncome {
    month: string;
    amount: number;
}
