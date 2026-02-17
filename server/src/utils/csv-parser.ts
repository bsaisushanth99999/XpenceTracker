import { parse } from 'csv-parse/sync';

export interface ParsedRow {
    date: string;
    amount: number;
    category: string;
    description: string;
    notes: string;
    type: 'income' | 'expense';
}

/**
 * Normalize category to Title Case so "food", "Food", "FOOD" all become "Food".
 * Trims whitespace and handles empty strings.
 */
function normalizeCategory(raw: string): string {
    const trimmed = raw.replace(/\s+/g, ' ').trim();
    if (!trimmed) return 'Uncategorized';
    return trimmed
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function normalizeDate(raw: string): string {
    const trimmed = raw.trim();
    // Strip time part if present (e.g. "01/02/2026 08:43:56")
    const datePart = trimmed.split(/\s+/)[0];

    // Already ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;

    // DD/MM/YYYY or D/M/YYYY
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
    const cleaned = raw.replace(/[^0-9.\-]/g, '');
    return Math.abs(parseFloat(cleaned) || 0);
}

/**
 * Find a matching column header (case-insensitive, trimmed).
 * Returns the actual header name found in the CSV, or null.
 */
function findCol(headers: string[], candidates: string[]): string | null {
    for (const c of candidates) {
        const found = headers.find((h) => h.trim().toLowerCase() === c.toLowerCase());
        if (found) return found;
    }
    return null;
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

    // --- Map CSV columns to our fields ---
    // The user's CSV format:  Date | To | Amount | category | From | Payee
    const dateCol = findCol(headers, ['date', 'transaction_date', 'trans_date', 'txn_date']);
    const amountCol = findCol(headers, ['amount', 'value', 'sum', 'total']);
    const categoryCol = findCol(headers, ['category', 'cat', 'group']);
    const toCol = findCol(headers, ['to', 'description', 'desc', 'memo', 'narration']);
    const fromCol = findCol(headers, ['from', 'source', 'payment_method']);
    const payeeCol = findCol(headers, ['payee', 'upi_id', 'account']);
    const notesCol = findCol(headers, ['notes', 'note', 'comment', 'comments']);
    const typeCol = findCol(headers, ['type', 'transaction_type', 'txn_type', 'kind']);

    if (!dateCol || !amountCol) {
        throw new Error('CSV must contain at least "Date" and "Amount" columns');
    }

    return records.map((row) => {
        // Description = "To" column (payee/recipient name)
        const to = toCol ? (row[toCol] ?? '').trim() : '';
        // From = payment method (e.g. "Paid via CRED")
        const from = fromCol ? (row[fromCol] ?? '').trim() : '';
        // Payee = UPI ID / reference
        const payee = payeeCol ? (row[payeeCol] ?? '').trim() : '';
        // Notes = explicit notes column if it exists
        const notes = notesCol ? (row[notesCol] ?? '').trim() : '';

        // Build description from "To" field
        const description = to;

        // Build notes: combine From + Payee + explicit notes
        const notesParts: string[] = [];
        if (from) notesParts.push(from);
        if (payee) notesParts.push(payee);
        if (notes) notesParts.push(notes);
        const combinedNotes = notesParts.join(' | ');

        // Type defaults to expense if no type column
        let type: 'income' | 'expense' = 'expense';
        if (typeCol) {
            const raw = (row[typeCol] ?? '').trim().toLowerCase();
            if (['income', 'credit', 'deposit', 'salary', 'earning'].includes(raw)) {
                type = 'income';
            }
        }

        return {
            date: normalizeDate(row[dateCol] ?? ''),
            amount: normalizeAmount(row[amountCol] ?? '0'),
            category: normalizeCategory(categoryCol ? row[categoryCol] ?? '' : ''),
            description,
            notes: combinedNotes,
            type,
        };
    });
}
