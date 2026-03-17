import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Sun, Moon, GraduationCap, User, LayoutDashboard, Briefcase, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/'); };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Courses', path: '/courses' },
    { name: 'AI Tutor', path: '/ai-assistant' },
    { name: 'Projects', path: '/projects' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }}
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <GraduationCap className="h-8 w-8 text-primary-500" />
            <span className="text-xl font-bold gradient-text">IntelliLearn</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'text-primary-500'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400'
                }`}>
                {link.name}
              </Link>
            ))}
            {isAuthenticated && (
              <Link to="/resume-analyzer"
                className={`text-sm font-medium transition-colors ${
                  isActive('/resume-analyzer')
                    ? 'text-primary-500'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary-500'
                }`}>
                Resume AI
              </Link>
            )}
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <button onClick={toggleTheme}
              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors">
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <NotificationBell />

            {isAuthenticated ? (
              <>
                <Link to="/dashboard"
                  className="flex items-center space-x-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                  <LayoutDashboard className="h-4 w-4" /><span>Dashboard</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-primary-500 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 flex items-center justify-center text-white text-xs font-bold">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="max-w-[80px] truncate">{user?.name || 'User'}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all border dark:border-gray-700">
                    <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                    <Link to="/resume-analyzer" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <FileText className="h-4 w-4" /> Resume AI
                    </Link>
                    <Link to="/projects" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Briefcase className="h-4 w-4" /> Projects
                    </Link>
                    <hr className="my-1 dark:border-gray-700" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-700 dark:text-gray-300 hover:text-primary-500 font-medium">Login</Link>
                <Link to="/signup" className="gradient-button px-5 py-2 text-sm">Sign Up</Link>
              </>
            )}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center space-x-2">
            <button onClick={toggleTheme} className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <NotificationBell />
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-lg text-gray-700 dark:text-gray-300">
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
          className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path}
                className={`block py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path) ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-500' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}>
                {link.name}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/resume-analyzer" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Resume AI</Link>
                <Link to="/dashboard" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</Link>
                <button onClick={handleLogout} className="w-full text-left py-2.5 px-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2.5 px-3 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">Login</Link>
                <Link to="/signup" className="block gradient-button text-center py-2.5 px-3 rounded-lg text-sm">Sign Up</Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
