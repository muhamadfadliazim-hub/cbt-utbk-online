import React, { useState } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

function App() {
  // Ambil data user dari penyimpanan lokal agar tahan refresh
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cbt_user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('cbt_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('cbt_user');
    window.location.href = "/";
  };

  // 1. Jika belum login, tampilkan halaman Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // 2. Jika Admin, tampilkan Dashboard Admin
  if (user.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // 3. Jika Siswa, tampilkan Dashboard Siswa
  return <StudentDashboard user={user} onLogout={handleLogout} />;
}

export default App;