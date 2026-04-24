import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { LogOut, BarChart2, Home, Archive, ShieldCheck, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <BarChart2 className="text-primary-500" size={24} />
          PollPulse
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary-500 transition-colors flex items-center gap-1.5">
            <Home size={16} /> Home
          </Link>
          <Link to="/past-polls" className="hover:text-primary-500 transition-colors flex items-center gap-1.5">
            <Archive size={16} /> Past Polls
          </Link>
          {isAuthenticated ? (
            <>
              {role === 'admin' && (
                <Link to="/admin" className="hover:text-primary-500 transition-colors flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-amber-400" /> Admin
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-primary-500 transition-colors">Login</Link>
              <Link to="/register" className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-gray-300 hover:text-white transition-colors p-1"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700 px-4 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
          <Link to="/" onClick={closeMenu} className="flex items-center gap-2 py-3 text-sm font-medium hover:text-primary-500 transition-colors border-b border-dark-700">
            <Home size={16} /> Home
          </Link>
          <Link to="/past-polls" onClick={closeMenu} className="flex items-center gap-2 py-3 text-sm font-medium hover:text-primary-500 transition-colors border-b border-dark-700">
            <Archive size={16} /> Past Polls
          </Link>
          {isAuthenticated ? (
            <>
              {role === 'admin' && (
                <Link to="/admin" onClick={closeMenu} className="flex items-center gap-2 py-3 text-sm font-medium hover:text-amber-400 transition-colors border-b border-dark-700">
                  <ShieldCheck size={16} className="text-amber-400" /> Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-2 py-3 text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/login" onClick={closeMenu} className="text-center py-2.5 text-sm font-medium border border-dark-600 rounded-lg hover:bg-dark-700 transition-colors">
                Login
              </Link>
              <Link to="/register" onClick={closeMenu} className="text-center py-2.5 text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors">
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
