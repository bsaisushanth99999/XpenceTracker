import { NavLink, Outlet } from 'react-router-dom';
import CsvUpload from './CsvUpload';
import ParticleSwarm from './ParticleSwarm';
import ThemeToggle from './ThemeToggle';
import ResetData from './ResetData';

export default function Layout() {
    return (
        <>
            <ParticleSwarm />
            <div className="reset-action-container">
                <ResetData />
            </div>
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
                        <CsvUpload />
                    </div>
                </nav>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </>
    );
}
