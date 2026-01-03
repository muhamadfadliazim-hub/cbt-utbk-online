import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    // Fungsi handleLoginSuccess dikirim sebagai properti 'onLogin'
    return <Login onLogin={handleLoginSuccess} />;
  }

  return user.role === 'admin' ? (
    <AdminDashboard onLogout={handleLogout} />
  ) : (
    <StudentDashboard user={user} onLogout={handleLogout} />
  );
}

export default App;