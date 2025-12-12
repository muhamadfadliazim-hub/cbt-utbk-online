import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import ExamSimulation from './ExamSimulation';
import UploadExam from './UploadExam';
import AdminDashboard from './AdminDashboard'; 
import { MajorSelection, Confirmation, ResultSummary } from './FlowComponents'; // Pastikan ResultSummary diimport!
import StudentRecap from './StudentRecap'; 
import { Loader2, AlertTriangle } from 'lucide-react';
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
  const location = useLocation();
  const [userData, setUserData] = useState(getSafeUserData);
  const [loading, setLoading] = useState(true);
  const [examResult, setExamResult] = useState(null); // State untuk hasil ujian

  useEffect(() => {
    // Logika Redirect yang Lebih Aman
    if (userData) {
      if (userData.role === 'admin') {
         if (location.pathname === '/' || location.pathname === '/login') navigate('/admin');
      } else {
         // Cek apakah sudah pilih jurusan?
         if (!userData.display1 && location.pathname !== '/select-major') {
             navigate('/select-major');
         } else if (userData.display1 && (location.pathname === '/' || location.pathname === '/login')) {
             navigate('/dashboard');
         }
      }
    } else {
      if (location.pathname !== '/login') navigate('/login');
    }
    setLoading(false);
  }, [userData, navigate, location.pathname]);

  const handleLogin = (loginData) => {
    const newData = { ...loginData, 
        display1: loginData.pilihan1 || '', pg1: loginData.pg1 || '',
        display2: loginData.pilihan2 || '', pg2: loginData.pg2 || '',
        choice1_id: loginData.choice1_id, choice2_id: loginData.choice2_id
    };
    setUserData(newData);
    localStorage.setItem('utbk_user', JSON.stringify(newData));

    if (newData.role === 'admin') navigate('/admin');
    else if (newData.display1) navigate('/confirmation'); // Sudah ada jurusan -> Konfirmasi
    else navigate('/select-major'); // Belum -> Pilih Jurusan
  };

  const handleLogout = () => {
    if(window.confirm("Keluar aplikasi?")) {
        localStorage.clear();
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

  // Handler saat ujian selesai
  const handleExamFinish = (resultData) => {
      setExamResult(resultData);
      navigate('/result');
  };

  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-indigo-600" size={40}/></div>;

  return (
    <Routes>
        <Route path="/login" element={!userData ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} />
        
        <Route path="/admin" element={userData?.role === 'admin' ? <AdminDashboard onLogout={handleLogout} /> : <Navigate to="/login" />} />
        <Route path="/upload" element={userData?.role === 'admin' ? <UploadExam onBack={() => navigate('/admin')} /> : <Navigate to="/login" />} />

        <Route path="/select-major" element={userData ? <MajorSelection onNext={handleMajorSelected} onLogout={handleLogout}/> : <Navigate to="/login" />} />
        
        <Route path="/confirmation" element={userData ? <Confirmation userData={userData} onStart={() => navigate('/dashboard')} onBack={() => navigate('/select-major')}/> : <Navigate to="/login" />} />

        <Route path="/dashboard" element={
            userData?.role === 'student' ? (
                <Dashboard 
                    userName={userData?.name} 
                    username={userData?.username}
                    onSelectExam={(examId) => navigate(`/exam/${examId}`)} 
                    onLogout={handleLogout} 
                    onGoToUpload={() => navigate('/upload')} 
                    onGoToRecap={() => navigate('/recap')} 
                />
            ) : <Navigate to="/login" />
        } />

        <Route path="/exam/:examId" element={userData ? <ExamSimulation onFinish={handleExamFinish} /> : <Navigate to="/login" />} />
        
        {/* Halaman Hasil Ujian */}
        <Route path="/result" element={userData && examResult ? <ResultSummary result={examResult} onBack={() => navigate('/dashboard')} /> : <Navigate to="/dashboard" />} />

        <Route path="/recap" element={userData ? <StudentRecap username={userData.username} onBack={() => navigate('/dashboard')} /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to={userData ? "/" : "/login"} />} />
    </Routes>
  );
};

// Error Boundary Sederhana
class ErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, info) { console.error("Error:", error, info); }
  render() {
    if (this.state.hasError) return <div className="p-4 text-center">Terjadi kesalahan. <button onClick={() => window.location.reload()} className="underline text-blue-600">Muat Ulang</button></div>;
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}