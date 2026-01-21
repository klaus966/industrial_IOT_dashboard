import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Machines from './pages/Machines';
import MachineDetails from './pages/MachineDetails';
import Reports from './pages/Reports';
import Layout from './components/Layout';

// Temporary placeholders
const Locations = () => <div className="p-4 text-xl">Location Map (Coming Soon)</div>;

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    // In a real app with async auth check, we'd handle loading state here
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

function App() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={
                <ProtectedRoute>
                    <Layout />
                </ProtectedRoute>
            }>
                <Route index element={<Dashboard />} />
                <Route path="machines" element={<Machines />} />
                <Route path="machines/:id" element={<MachineDetails />} />
                <Route path="locations" element={<Locations />} />
                <Route path="reports" element={<Reports />} />
            </Route>
        </Routes>
    );
}

export default App;
