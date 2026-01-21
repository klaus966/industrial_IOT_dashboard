import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Server, MapPin, FileText, LogOut, Settings } from 'lucide-react';
import clsx from 'clsx';
import { Toaster } from 'react-hot-toast';

export default function Layout() {
    const { logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Assets', path: '/machines', icon: Server },
        { name: 'Locations', path: '/locations', icon: MapPin },
        { name: 'Reports', path: '/reports', icon: FileText },
    ];

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-dark text-gray-900 dark:text-gray-100 overflow-hidden">
            <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 4000 }} />
            {/* Sidebar */}
            <div className="w-64 bg-white dark:bg-card border-r dark:border-gray-800 flex flex-col">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-primary flex items-center gap-2">
                        🏭 Industrial IoT
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                                )}
                            >
                                <Icon size={20} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t dark:border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <LogOut size={20} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white dark:bg-card border-b dark:border-gray-800 h-16 flex items-center px-8 justify-between">
                    <h2 className="text-lg font-semibold">
                        {navItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        <span className="text-sm font-medium">Admin User</span>
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
