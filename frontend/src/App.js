import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import ExamSimulation from './ExamSimulation';
import UploadExam from './UploadExam';
import AdminDashboard from './AdminDashboard'; 
import { MajorSelection, Confirmation } from './FlowComponents';
import StudentRecap from './StudentRecap'; 
import './App.css';

// --- PENGAMAN DATA ---
const getSafeUserData = () => {
  try {
    const saved = localStorage.getItem('utbk_user');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    localStorage.removeItem('utbk_user');
    return null;
  }
};

const AppContent = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(getSafeUserData);
  const [loading, setLoading] = useState(true);

  // Cek Status Login
  useEffect(() => {
    // Simulasi loading sebentar agar transisi halus
    setTimeout(() => {
        if (userData) {
            if (userData.role === 'admin') {
                if (window.location.pathname === '/' || window.location.pathname === '/login') navigate('/admin');
            } else {
                if (!userData.display1) navigate('/select-major');
                else if (window.location.pathname === '/' || window.location.pathname === '/login') navigate('/dashboard');
            }
        } else {
            if (window.location.pathname !== '/login') navigate('/login');
        }
        setLoading(false);
    }, 500);
  }, [userData, navigate]);

  const handleLogin = (loginData) => {
    const newData = { ...loginData, 
        display1: loginData.pilihan1 || '', pg1: loginData.pg1 || '',
        display2: loginData.pilihan2 || '', pg2: loginData.pg2 || ''
    };
    setUserData(newData);
    localStorage.setItem('utbk_user', JSON.stringify(newData));

    if (newData.role === 'admin') navigate('/admin');
    else if (newData.display1) navigate('/confirmation');
    else navigate('/select-major');
  };

  const handleLogout = () => {
    if(window.confirm("Keluar aplikasi?")) {
        localStorage.removeItem('utbk_user');
        localStorage.removeItem('current_exam_id');
        setUserData(null);
        navigate('/login');
    }
  };

  const handleMajorSelected = async (selectionData) => {
    const newData = { ...userData, ...selectionData };
    setUserData(newData);
    localStorage.setItem('utbk_user', JSON.stringify(newData));
    navigate('/confirmation');
  };

  // HINDARI ICON DI SINI (Gunakan Teks Saja agar Aman)
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 flex-col">
        <div className="text-2xl font-bold text-indigo-600 mb-2">Simulasi SNBT</div>
        <div className="text-gray-500">Memuat data...</div>
    </div>
  );

  return (
    <Routes>
        <Route path="/login" element={!userData ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="/admin" element={userData?.role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/upload" element={userData?.role === 'admin' ? <UploadExam onBack={() => navigate('/admin')} /> : <Navigate to="/login" />} />
        <Route path="/select-major" element={userData ? <MajorSelection onNext={handleMajorSelected} onLogout={handleLogout}/> : <Navigate to="/login" />} />
        <Route path="/confirmation" element={userData ? <Confirmation userData={userData} onStart={() => navigate('/dashboard')} onBack={() => navigate('/select-major')}/> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={userData?.role === 'student' ? <Dashboard userName={userData?.name} username={userData?.username} onSelectExam={(examId) => navigate(`/exam/${examId}`)} onLogout={handleLogout} onGoToUpload={() => navigate('/upload')} onGoToRecap={() => navigate('/recap')} /> : <Navigate to="/login" />} />
        <Route path="/exam/:examId" element={userData ? <ExamSimulation /> : <Navigate to="/login" />} />
        <Route path="/recap" element={userData ? <StudentRecap username={userData.username} onBack={() => navigate('/dashboard')} /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={userData ? "/" : "/login"} />} />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
        <AppContent />
    </BrowserRouter>
  );
}

export default App;