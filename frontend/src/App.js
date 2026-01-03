import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
// IMPORT StudentDashboard, BUKAN Dashboard lama
import StudentDashboard from './StudentDashboard'; 
import AdminDashboard from './AdminDashboard'; 
import { API_URL } from './config';
import './App.css';

const getSafeUserData = () => {
  try {
    const saved = localStorage.getItem('utbk_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    localStorage.removeItem('utbk_user');
    return null;
  }
};

export default function App() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(getSafeUserData());

  const handleLoginSuccess = (data) => {
    localStorage.setItem('utbk_user', JSON.stringify(data));
    setUserData(data);
    if (data.role === 'admin') navigate('/admin');
    else navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('utbk_user');
    setUserData(null);
    navigate('/login');
  };

  return (
    <div className="App font-sans">
      <Routes>
        <Route path="/login" element={!userData ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to={userData.role === 'admin' ? "/admin" : "/dashboard"} />} />
        
        {/* PASTIKAN ROUTE INI MENGGUNAKAN StudentDashboard */}
        <Route path="/dashboard" element={
          userData && userData.role !== 'admin' ? 
          <StudentDashboard user={userData} onLogout={handleLogout} /> : 
          <Navigate to="/login" />
        } />

        <Route path="/admin" element={
          userData && userData.role === 'admin' ? 
          <AdminDashboard onLogout={handleLogout} /> : 
          <Navigate to="/login" />
        } />

        <Route path="/" element={<Navigate to={userData ? (userData.role === 'admin' ? "/admin" : "/dashboard") : "/login"} />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}