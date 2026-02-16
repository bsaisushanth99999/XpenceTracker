import crypto from 'crypto';

export function generateFingerprint(
    date: string,
    amount: number,
    description: string,
    type: string
): string {
    const raw = `${date}|${amount}|${description.trim().toLowerCase()}|${type.toLowerCase()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}
