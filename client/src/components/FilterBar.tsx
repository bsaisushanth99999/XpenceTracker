import { useFilters } from '../context/FilterContext';
import { useCategories } from '../hooks/useTransactions';

function getMonthOptions(): { value: string; label: string }[] {
    const options: { value: string; label: string }[] = [];
    const now = new Date();
    // Show last 12 months + current
    for (let i = 0; i < 13; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const val = d.toISOString().slice(0, 7);
        const label = d.toLocaleDateString('en-IN', { year: 'numeric', month: 'long' });
        options.push({ value: val, label });
    }
    return options;
}

export default function FilterBar() {
    const { filters, setFilters, resetFilters } = useFilters();
    const categories = useCategories();
    const monthOptions = getMonthOptions();

    const hasActiveFilters = filters.categories.length > 0 || filters.month === 'all';

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
