import { NavLink, Outlet } from 'react-router-dom';
import CsvUpload from './CsvUpload';
import ParticleSwarm from './ParticleSwarm';
import { useTheme } from '../context/ThemeContext';

export default function Layout() {
    const { theme, setTheme } = useTheme();

    return (
        <>
            <ParticleSwarm />
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
                    <div className="theme-toggle">
                        <button
                            className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                            onClick={() => setTheme('system')}
                            title="System theme"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                <path d="M8 21h8M12 17v4" />
                            </svg>
                        </button>
                        <button
                            className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                            onClick={() => setTheme('light')}
                            title="Light mode"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="5" />
                                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                            </svg>
                        </button>
                        <button
                            className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={() => setTheme('dark')}
                            title="Dark mode"
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                            </svg>
                        </button>
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
