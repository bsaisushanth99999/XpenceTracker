import React, { createContext, useContext, useState, ReactNode } from 'react';
import { FilterState } from '../types';

function getCurrentMonth(): string {
    return new Date().toISOString().slice(0, 7); // YYYY-MM
}

const defaultFilters: FilterState = {
    month: getCurrentMonth(),
    categories: [],
};

interface FilterContextType {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    resetFilters: () => void;
    buildQueryString: () => string;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export function FilterProvider({ children }: { children: ReactNode }) {
    const [filters, setFilters] = useState<FilterState>(defaultFilters);

    const resetFilters = () => setFilters(defaultFilters);

    const buildQueryString = (): string => {
        const params = new URLSearchParams();
        if (filters.month && filters.month !== 'all') {
            // Derive dateFrom and dateTo from month
            const [y, m] = filters.month.split('-').map(Number);
            const dateFrom = `${filters.month}-01`;
            const lastDay = new Date(y, m, 0).getDate();
            const dateTo = `${filters.month}-${String(lastDay).padStart(2, '0')}`;
            params.set('dateFrom', dateFrom);
            params.set('dateTo', dateTo);
        }
        if (filters.categories.length > 0) {
            params.set('categories', filters.categories.join(','));
        }
        return params.toString();
    };

    return (
        <FilterContext.Provider value={{ filters, setFilters, resetFilters, buildQueryString }}>
            {children}
        </FilterContext.Provider>
    );
}

export function useFilters() {
    const context = useContext(FilterContext);
    if (!context) throw new Error('useFilters must be used within FilterProvider');
    return context;
}
