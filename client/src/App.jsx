import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
      <Navigation />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      
    
      <div className="fixed inset-0 -z-10 opacity-[0.03]">
    
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              radial-gradient(circle at 25% 25%, rgba(99, 102, 241, 0.1) 0%, transparent 70%),
              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.1) 0%, transparent 70%),
              linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
              linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '800px 800px, 800px 800px, 40px 40px, 40px 40px',
            backgroundPosition: '0% 0%, 100% 100%, 0% 0%, 0% 0%'
          }}
        />
        
        {/* Subtle Dot Pattern */}
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fillRule="evenodd"%3E%3Ccircle fill="%236366f1" cx="30" cy="30" r="1.5" opacity="0.4"/%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] via-transparent to-purple-500/[0.02]" />
      </div>
      
      {/* Floating Elements for Professional Feel */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Top Left Gradient Orb */}
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/10 to-blue-500/10 rounded-full blur-3xl" />
        
        {/* Top Right Gradient Orb */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-purple-400/10 to-indigo-500/10 rounded-full blur-3xl" />
        
        {/* Bottom Left Gradient Orb */}
        <div className="absolute -bottom-40 -left-20 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 rounded-full blur-3xl" />
        
        {/* Bottom Right Gradient Orb */}
        <div className="absolute -bottom-20 -right-40 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-purple-500/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
}

export default App;