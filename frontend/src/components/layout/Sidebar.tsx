import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';

const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/operaciones', label: 'Operaciones', icon: '📋' },
    { path: '/alertas', label: 'Alertas', icon: '🚨', badge: 5 },
    { path: '/reportes', label: 'Reportes UAFE', icon: '📄' },
    { path: '/configuracion', label: 'Configuración', icon: '⚙️' },
];

export default function Sidebar() {
    const location = useLocation();
    const user = useAuthStore((state) => state.user);

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-primary-600">VSinnfo</h1>
            </div>

            {/* Navigation */}
            <nav className="p-4">
                <ul className="space-y-2">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-primary-50 text-primary-700 font-medium'
                                            : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User info at bottom */}
            {user && (
                <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm">
                        <p className="font-medium text-gray-900">{user.nombre} {user.apellido}</p>
                        <p className="text-gray-500">{user.rol.replace('_', ' ')}</p>
                    </div>
                </div>
            )}
        </aside>
    );
}
