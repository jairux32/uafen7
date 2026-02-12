import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import toast from 'react-hot-toast';

export default function Header() {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        toast.success('Sesión cerrada');
        navigate('/login');
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Bienvenido, {user?.nombre}
                    </h2>
                </div>

                <div className="flex items-center gap-4">
                    {/* Notifications */}
                    <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                        <span className="text-2xl">🔔</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User menu */}
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {user?.nombre} {user?.apellido}
                            </p>
                            <p className="text-xs text-gray-500">{user?.rol.replace('_', ' ')}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            title="Cerrar sesión"
                        >
                            <span className="text-xl">🚪</span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
