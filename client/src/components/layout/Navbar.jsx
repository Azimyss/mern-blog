import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Bars3Icon, 
  XMarkIcon, 
  HomeIcon, 
  RssIcon, 
  PlusIcon, 
  UserIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const isAuthenticated = !!currentUser;
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
  };

  // Проверка активного маршрута
  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const mobileMenuItems = [
    { path: '/', label: 'Главная', icon: HomeIcon },
    ...(isAuthenticated 
      ? [
          { path: '/feed', label: 'Моя лента', icon: RssIcon },
          { path: '/create-post', label: 'Создать пост', icon: PlusIcon },
          { path: '/dashboard', label: 'Панель управления', icon: Cog6ToothIcon },
          { path: `/user/${currentUser?.username}`, label: 'Мой профиль', icon: UserIcon }
        ] 
      : []),
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Логотип */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary-500">MERN Blog</span>
            </Link>
          </div>

          {/* Десктопное меню */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className={`px-3 py-2 ${
                isActive('/') 
                  ? 'text-primary-500 font-medium border-b-2 border-primary-500' 
                  : 'text-gray-700 hover:text-primary-500'
              }`}
            >
              Главная
            </Link>
            
            {isAuthenticated && (
              <>
                <Link 
                  to="/feed" 
                  className={`px-3 py-2 ${
                    isActive('/feed') 
                      ? 'text-primary-500 font-medium border-b-2 border-primary-500' 
                      : 'text-gray-700 hover:text-primary-500'
                  }`}
                >
                  Моя лента
                </Link>
                <Link 
                  to="/create-post" 
                  className={`px-3 py-2 flex items-center ${
                    isActive('/create-post') 
                      ? 'text-primary-500 font-medium border-b-2 border-primary-500' 
                      : 'text-gray-700 hover:text-primary-500'
                  }`}
                >
                  <PlusIcon className="w-4 h-4 mr-1" />
                  Создать пост
                </Link>
                <Link 
                  to="/dashboard" 
                  className={`px-3 py-2 ${
                    isActive('/dashboard') 
                      ? 'text-primary-500 font-medium border-b-2 border-primary-500' 
                      : 'text-gray-700 hover:text-primary-500'
                  }`}
                >
                  Управление
                </Link>
              </>
            )}
          </div>

          {/* Десктопные кнопки авторизации */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to={`/user/${currentUser.username}`}
                  className="flex items-center text-gray-700 hover:text-primary-500"
                >
                  <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white mr-2">
                    {currentUser.username[0].toUpperCase()}
                  </div>
                  <span className="font-medium">{currentUser.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-1.5 border border-red-500 text-red-500 hover:bg-red-50 rounded-md font-medium transition-colors"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary-500 font-medium"
                >
                  Войти
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 bg-primary-500 text-white hover:bg-primary-600 rounded-md font-medium transition-colors"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>

          {/* Мобильная кнопка меню */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-md text-gray-500 hover:text-primary-500 hover:bg-gray-100 focus:outline-none"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="bg-white border-t border-gray-200 py-2 px-4 space-y-1">
          {isAuthenticated && (
            <div className="flex items-center border-b border-gray-100 pb-3 mb-2">
              <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white mr-3">
                {currentUser.username[0].toUpperCase()}
              </div>
              <span className="font-semibold text-gray-800">
                {currentUser.username}
              </span>
            </div>
          )}
          
          {mobileMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link 
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md ${
                  isActive(item.path) 
                    ? 'bg-primary-50 text-primary-500' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className={isActive(item.path) ? 'font-medium' : ''}>
                  {item.label}
                </span>
              </Link>
            );
          })}
          
          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="w-full text-left flex items-center px-3 py-2 text-red-500 hover:bg-red-50 rounded-md mt-4"
            >
              <span className="font-medium">Выйти</span>
            </button>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-100">
              <Link
                to="/login"
                className="block px-3 py-2 text-gray-700 font-medium hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                Войти
              </Link>
              <Link
                to="/register"
                className="block px-3 py-2 mt-2 bg-primary-500 text-white hover:bg-primary-600 rounded-md font-medium text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                Регистрация
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 