import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-primary text-white shadow-md">
      <div className="font-bold text-xl">
        <Link to="/" className="text-white hover:text-opacity-90">Multi-Tenant Notes App</Link>
      </div>
      <div className="flex items-center gap-6">
        {isAuthenticated ? (
          <>
            <span className="text-sm opacity-90">
              {user.email} ({user.tenant.name} - {user.role})
            </span>
            <Link to="/dashboard" className="text-white hover:underline">Dashboard</Link>
            <button onClick={handleLogout} className="border border-white px-3 py-1 rounded text-sm hover:bg-white/10 transition-colors">
              Logout
            </button>
          </>
        ) : (
          <Link to="/login" className="text-white hover:underline">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;