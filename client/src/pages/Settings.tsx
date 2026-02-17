import React from 'react';
import CsvUpload from '../components/CsvUpload';
import ResetData from '../components/ResetData';

export default function Settings() {
    return (
        <div className="settings-page">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Settings</h1>
                    <p className="page-subtitle">Manage your data and preferences</p>
                </div>
            </header>

            <div className="settings-grid">
                {/* Data Management Section */}
                <section className="settings-card">
                    <div className="card-header">
                        <div className="card-icon upload-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        </div>
                        <div className="card-title">
                            <h3>Import Data</h3>
                            <p>Upload your transactions via CSV file</p>
                        </div>
                    </div>
                    <div className="card-action">
                        <CsvUpload />
                    </div>
                </section>

                <section className="settings-card destructive">
                    <div className="card-header">
                        <div className="card-icon reset-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </div>
                        <div className="card-title">
                            <h3>Reset Data</h3>
                            <p>Permanently delete all transactions and goals</p>
                        </div>
                    </div>
                    <div className="card-action">
                        <ResetData />
                    </div>
                </section>
            </div>
        </div>
    );
}
