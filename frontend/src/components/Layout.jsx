import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-sand">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl">🌊</span>
              <span className="font-bold text-ocean-900 text-xl">Pacific Reef</span>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link to="/rooms" className="text-gray-600 hover:text-ocean-600">
                {t('nav.rooms')}
              </Link>
              
              {user ? (
                <>
                  <span className="text-sm text-gray-500">
                    {user.first_name} ({user.role})
                  </span>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-ocean-600 font-medium">Admin</Link>
                  )}
                  {(user.role === 'employee' || user.role === 'admin') && (
                    <Link to="/employee" className="text-ocean-600 font-medium">Staff</Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-ocean-600">{t('nav.login')}</Link>
                  <Link to="/register" className="btn-primary text-sm">
                    {t('nav.register')}
                  </Link>
                </>
              )}
              
              <button 
                onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}
                className="text-xs border border-ocean-200 px-2 py-1 rounded text-ocean-600"
              >
                {i18n.language === 'es' ? 'EN' : 'ES'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-12">{children}</main>
      
      <footer className="bg-ocean-900 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>Hotel Pacific Reef © 2024 - Prototipo ERS</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;