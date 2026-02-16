import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FilterProvider } from './context/FilterContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Goals from './pages/Goals';

export default function App() {
    return (
        <FilterProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<Layout />}>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/transactions" element={<Transactions />} />
                        <Route path="/goals" element={<Goals />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </FilterProvider>
    );
}
