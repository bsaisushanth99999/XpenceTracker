import { useFilters } from '../context/FilterContext';
import { useCategories, useMonths } from '../hooks/useTransactions';

export default function FilterBar() {
    const { filters, setFilters, resetFilters } = useFilters();
    const categories = useCategories();
    const months = useMonths();

    const monthOptions = months.map(m => {
        const [y, mm] = m.split('-').map(Number);
        return {
            value: m,
            label: new Date(y, mm - 1, 1).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })
        };
    });

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const hasActiveFilters = filters.categories.length > 0 || filters.month !== currentMonth;

    const toggleCategory = (cat: string) => {
        setFilters((prev) => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter((c) => c !== cat)
                : [...prev.categories, cat],
        }));
    };

    return (
        <div className="filter-bar">
            <div className="filter-bar-header">
                <div className="month-selector">
                    <select
                        value={filters.month}
                        onChange={(e) => setFilters((prev) => ({ ...prev, month: e.target.value }))}
                    >
                        <option value="all">All Time</option>
                        {monthOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {hasActiveFilters && (
                    <button className="filter-reset" onClick={resetFilters}>
                        Clear filters
                    </button>
                )}
            </div>

            {categories.length > 0 && (
                <div className="filter-bar-body">
                    <div className="filter-chips">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                className={`filter-chip ${filters.categories.includes(cat) ? 'active' : ''}`}
                                onClick={() => toggleCategory(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
