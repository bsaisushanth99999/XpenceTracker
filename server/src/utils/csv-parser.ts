import { parse } from 'csv-parse/sync';

export interface ParsedRow {
    date: string;
    amount: number;
    category: string;
    description: string;
    notes: string;
    type: 'income' | 'expense';
}

// Flexible column name mapping (include common bank/export formats like "To", "Payee")
const COLUMN_MAP: Record<string, string[]> = {
    date: ['date', 'transaction_date', 'trans_date', 'txn_date', 'Date'],
    amount: ['amount', 'value', 'sum', 'total', 'Amount'],
    category: ['category', 'cat', 'group', 'Category'],
    description: ['description', 'desc', 'memo', 'note', 'Description', 'Memo', 'To', 'Payee', 'From', 'Narration'],
    notes: ['notes', 'note', 'comment', 'comments', 'Notes'],
    type: ['type', 'transaction_type', 'txn_type', 'kind', 'Type'],
};

function findColumn(headers: string[], candidates: string[]): string | null {
    for (const candidate of candidates) {
        const found = headers.find(
            (h) => h.trim().toLowerCase() === candidate.toLowerCase()
        );
        if (found) return found;
    }
    return null;
}

function normalizeDate(raw: string): string {
    // Try parsing various date formats
    const trimmed = raw.trim();
    // Strip time part if present (e.g. "01/02/2026 08:43:56" or "2026-01-02 10:00:00")
    const datePart = trimmed.split(/\s+/)[0];

    // Already ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;

    // DD/MM/YYYY or D/M/YYYY (date with optional time) - common in bank exports
    const slashMatch = datePart.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slashMatch) {
        const [, d, m, y] = slashMatch;
        return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }

    // DD-MM-YYYY
    const dashMatch = datePart.match(/^(\d{2})-(\d{2})-(\d{4})$/);
    if (dashMatch) {
        const [, d, m, y] = dashMatch;
        return `${y}-${m}-${d}`;
    }

    // Fallback: try Date constructor
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
        const y = parsed.getFullYear();
        const m = String(parsed.getMonth() + 1).padStart(2, '0');
        const d = String(parsed.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    return datePart || trimmed;
}

function normalizeAmount(raw: string | number): number {
    if (typeof raw === 'number') return Math.abs(raw);
    // Remove currency symbols, commas, spaces
    const cleaned = raw.replace(/[^0-9.\-]/g, '');
    return Math.abs(parseFloat(cleaned) || 0);
}

function normalizeType(raw: string): 'income' | 'expense' {
    const lower = raw.trim().toLowerCase();
    if (['income', 'credit', 'deposit', 'salary', 'earning'].includes(lower)) {
        return 'income';
    }
    return 'expense';
}

function normalizeCategory(raw: string): string {
    const trimmed = raw.trim();
    if (!trimmed) return 'Uncategorized';
    // Title Case: capitalize first letter of each word
    return trimmed
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseCSV(buffer: { toString(encoding?: string): string }): ParsedRow[] {
    const content = buffer.toString('utf-8');
    const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        bom: true,
    }) as Record<string, string>[];

    if (records.length === 0) return [];

    const headers = Object.keys(records[0]);

    const dateCol = findColumn(headers, COLUMN_MAP.date);
    const amountCol = findColumn(headers, COLUMN_MAP.amount);
    const categoryCol = findColumn(headers, COLUMN_MAP.category);
    const descCol = findColumn(headers, COLUMN_MAP.description);
    const notesCol = findColumn(headers, COLUMN_MAP.notes);
    const typeCol = findColumn(headers, COLUMN_MAP.type);

    if (!dateCol || !amountCol) {
        throw new Error('CSV must contain at least "date" and "amount" columns');
    }

    return records.map((row) => ({
        date: normalizeDate(row[dateCol] ?? ''),
        amount: normalizeAmount(row[amountCol] ?? '0'),
        category: normalizeCategory(categoryCol ? row[categoryCol] ?? '' : ''),
        description: (descCol ? row[descCol]?.trim() : null) || '',
        notes: (notesCol ? row[notesCol]?.trim() : null) || '',
        type: typeCol ? normalizeType(row[typeCol] ?? '') : 'expense',
    }));
}
