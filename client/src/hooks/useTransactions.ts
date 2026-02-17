import { useState, useEffect, useCallback } from 'react';
import { useFilters } from '../context/FilterContext';
import { Transaction, TransactionSummary, CategoryBreakdown, TimeSeriesPoint } from '../types';

const API = '/api/transactions';

export function useTransactions() {
    const { buildQueryString } = useFilters();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        try {
            const qs = buildQueryString();
            const res = await fetch(`${API}?${qs}`);
            const data = await res.json();
            setTransactions(data);
        } catch (err) {
            console.error('Failed to fetch transactions', err);
        } finally {
            setLoading(false);
        }
    }, [buildQueryString]);

    useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

    return { transactions, loading, refetch: fetchTransactions };
}

export function useSummary() {
    const { buildQueryString } = useFilters();
    const [summary, setSummary] = useState<TransactionSummary>({ totalIncome: 0, totalExpenses: 0, balance: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const qs = buildQueryString();
                const res = await fetch(`${API}/summary?${qs}`);
                setSummary(await res.json());
            } catch (err) {
                console.error('Failed to fetch summary', err);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [buildQueryString]);

    return { summary, loading };
}

export function useCategoryBreakdown() {
    const { buildQueryString } = useFilters();
    const [data, setData] = useState<CategoryBreakdown[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const qs = buildQueryString();
                const res = await fetch(`${API}/by-category?${qs}`);
                setData(await res.json());
            } catch (err) {
                console.error('Failed to fetch category breakdown', err);
            }
        };
        fetchData();
    }, [buildQueryString]);

    return data;
}

export function useTimeSeries() {
    const { buildQueryString } = useFilters();
    const [data, setData] = useState<TimeSeriesPoint[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const qs = buildQueryString();
                const res = await fetch(`${API}/over-time?${qs}`);
                setData(await res.json());
            } catch (err) {
                console.error('Failed to fetch time series', err);
            }
        };
        fetchData();
    }, [buildQueryString]);

    return data;
}

export function useMonths() {
    const [months, setMonths] = useState<string[]>([]);

    useEffect(() => {
        fetch(`${API}/months`)
            .then((r) => r.json())
            .then(setMonths)
            .catch(console.error);
    }, []);

    return months;
}

export function useCategories() {
    const [categories, setCategories] = useState<string[]>([]);

    useEffect(() => {
        fetch(`${API}/categories`)
            .then((r) => r.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    return categories;
}
