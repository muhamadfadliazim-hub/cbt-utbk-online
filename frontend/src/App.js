import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import ExamSimulation from './ExamSimulation';
import UploadExam from './UploadExam';
import AdminDashboard from './AdminDashboard'; 
// FIX: Removed ResultSummary from imports
import { MajorSelection, Confirmation } from './FlowComponents';
import StudentRecap from './StudentRecap'; 
import { Loader2 } from 'lucide-react';
import './App.css';

// --- KOMPONEN PEMBUNGKUS (WRAPPER) UNTUK LOGIKA LAMA ---
const AppContent = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(() => {
      const saved = localStorage.getItem('utbk_user');
      return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Cek Status Login saat Aplikasi Dimulai
  useEffect(() => {
    if (userData) {
      if (userData.role === 'admin') {
         // Admin langsung ke dashboard admin
         if (window.location.pathname === '/') navigate('/admin');
      } else {
         // Siswa dicek apakah sudah pilih jurusan
         if (!userData.display1) navigate('/select-major');
         else if (window.location.pathname === '/') navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
    setLoading(false);
  }, [userData, navigate]);

  // --- HANDLERS (Fungsi Logika) ---
  const handleLogin = (loginData) => {
    const newData = { 
        ...userData, 
        name: loginData.name, 
        username: loginData.username, 
        role: loginData.role,
        display1: loginData.pilihan1 || '', 
        display2: loginData.pilihan2 || '',
        pg1: loginData.pg1 || '', 
        pg2: loginData.pg2 || '',
        choice1_id: loginData.choice1_id, 
        choice2_id: loginData.choice2_id
    };
    
    setUserData(newData);
    localStorage.setItem('utbk_user', JSON.stringify(newData));

    if (loginData.role === 'admin') {
        navigate('/admin');
    } else {
        if (loginData.pilihan1) navigate('/confirmation'); // Sudah punya jurusan -> Konfirmasi
        else navigate('/select-major'); // Belum -> Pilih Jurusan
    }
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

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin"/></div>;

  return (
    <Routes>
        {/* HALAMAN PUBLIK */}
        <Route path="/login" element={!userData ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />

        {/* HALAMAN ADMIN */}
        <Route path="/admin" element={userData?.role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/upload" element={userData?.role === 'admin' ? <UploadExam onBack={() => navigate('/admin')} /> : <Navigate to="/login" />} />

        {/* HALAMAN SISWA - ALUR PENDAFTARAN */}
        <Route path="/select-major" element={userData ? <MajorSelection onNext={handleMajorSelected} onLogout={handleLogout}/> : <Navigate to="/login" />} />
        <Route path="/confirmation" element={userData ? <Confirmation userData={userData} onStart={() => navigate('/dashboard')} onBack={() => navigate('/select-major')}/> : <Navigate to="/login" />} />

        {/* HALAMAN SISWA - UTAMA */}
        <Route path="/dashboard" element={
            userData?.role === 'student' ? (
                <Dashboard 
                    userName={userData?.name} 
                    username={userData?.username}
                    onSelectExam={(examId) => navigate(`/exam/${examId}`)} 
                    onLogout={handleLogout} 
                    onGoToUpload={() => navigate('/upload')} // Jika admin nyasar
                    onGoToRecap={() => navigate('/recap')} 
                />
            ) : <Navigate to="/login" />
        } />

        {/* HALAMAN UJIAN (BARU) */}
        <Route path="/exam/:examId" element={userData ? <ExamSimulation /> : <Navigate to="/login" />} />

        {/* HALAMAN REKAP NILAI SISWA */}
        <Route path="/recap" element={userData ? <StudentRecap username={userData.username} onBack={() => navigate('/dashboard')} /> : <Navigate to="/login" />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to={userData ? "/" : "/login"} />} />
    </Routes>
  );
};

// --- KOMPONEN UTAMA (YANG DIPANGGIL DI INDEX.JS) ---
function App() {
  return (
    <BrowserRouter>
        <AppContent />
    </BrowserRouter>
  );
}

export default App;