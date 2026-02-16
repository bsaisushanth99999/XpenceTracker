import React, { useRef, useState } from 'react';
import { UploadResult } from '../types';

export default function CsvUpload({ onUploadComplete }: { onUploadComplete?: () => void }) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [result, setResult] = useState<UploadResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setResult(null);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/transactions/upload', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Upload failed');
            }
            const data: UploadResult = await res.json();
            setResult(data);
            onUploadComplete?.();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setUploading(false);
            if (fileRef.current) fileRef.current.value = '';
        }
    };

    return (
        <div className="csv-upload">
            <label className="upload-btn" data-uploading={uploading}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1v10M4 5l4-4 4 4M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {uploading ? 'Uploading…' : 'Upload CSV'}
                <input
                    ref={fileRef}
                    type="file"
                    accept=".csv"
                    onChange={handleUpload}
                    disabled={uploading}
                    hidden
                />
            </label>
            {result && (
                <div className="upload-result">
                    <span className="result-item">Processed: <strong>{result.rowsProcessed}</strong></span>
                    <span className="result-item inserted">Inserted: <strong>{result.rowsInserted}</strong></span>
                    <span className="result-item skipped">Skipped: <strong>{result.duplicatesSkipped}</strong></span>
                    <button className="dismiss-btn" onClick={() => setResult(null)}>✕</button>
                </div>
            )}
            {error && (
                <div className="upload-error">
                    {error}
                    <button className="dismiss-btn" onClick={() => setError(null)}>✕</button>
                </div>
            )}
        </div>
    );
}
