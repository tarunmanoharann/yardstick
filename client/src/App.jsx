import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-amber-50 to-yellow-50">
      <Navigation />
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
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
      
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10 opacity-[0.02]">
        <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0">
          <g fill="none" fillRule="evenodd">
            <circle fill="#f59e0b" cx="30" cy="30" r="2"/>
          </g>
        </svg>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fillRule="evenodd"%3E%3Ccircle fill="%23f59e0b" cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/svg%3E")'
        }} />
      </div>
    </div>
  );
}

export default App;