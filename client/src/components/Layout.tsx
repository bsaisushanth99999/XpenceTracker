import { NavLink, Outlet } from 'react-router-dom';
import CsvUpload from './CsvUpload';
import ParticleSwarm from './ParticleSwarm';
import ThemeToggle from './ThemeToggle';
import ResetData from './ResetData';

export default function Layout() {
    return (
        <>
            <ParticleSwarm />
            <div className="theme-action-container">
                <ThemeToggle />
            </div>
            <div className="app-layout">
                <nav className="sidebar">
                    <div className="sidebar-brand">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <rect x="1" y="1" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M5 14V9M8 14V6M11 14V10M14 14V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                        <span>ExpenseTracker</span>
                    </div>
                    <div className="sidebar-links">
                        <NavLink to="/" end>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 8l6-6 6 6M4 7v6h3v-3h2v3h3V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Dashboard
                        </NavLink>
                        <NavLink to="/transactions">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                            </svg>
                            Transactions
                        </NavLink>
                        <NavLink to="/goals">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3" />
                                <circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.3" />
                                <circle cx="8" cy="8" r="0.8" fill="currentColor" />
                            </svg>
                            Goals
                        </NavLink>
                    </div>
                    <div className="sidebar-footer">
                        <NavLink to="/settings" className="settings-link">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                            Settings
                        </NavLink>
                    </div>
                </nav>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </>
    );
}
