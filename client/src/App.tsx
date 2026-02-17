import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';
import Settings from './pages/Settings';

export default function App() {
    return (
        <ThemeProvider>
            <FilterProvider>
                <BrowserRouter>
                    <Routes>
                        <Route element={<Layout />}>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/transactions" element={<Transactions />} />
                            <Route path="/goals" element={<Goals />} />
                            <Route path="/settings" element={<Settings />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </FilterProvider>
        </ThemeProvider>
    );
}

