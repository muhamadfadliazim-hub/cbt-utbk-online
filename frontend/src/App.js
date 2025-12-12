import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, AlertTriangle } from 'lucide-react'; // Pastikan lucide-react terinstall
import './App.css';

// Import Halaman (Pastikan file-file ini ada dan tidak error)
import Login from './Login';
import Dashboard from './Dashboard';
import ExamSimulation from './ExamSimulation';
import UploadExam from './UploadExam';
import AdminDashboard from './AdminDashboard'; 
import { MajorSelection, Confirmation } from './FlowComponents';
import StudentRecap from './StudentRecap'; 

// --- 1. ERROR BOUNDARY (CCTV PENCATAT ERROR) ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  
  componentDidCatch(error, errorInfo) { 
    console.error("CRITICAL APP ERROR:", error, errorInfo); 
    this.setState({ errorInfo });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center p-6 bg-red-50 text-center font-sans">
          <div className="bg-white p-8 rounded-xl shadow-xl max-w-2xl border-l-8 border-red-600">
            <AlertTriangle size={64} className="text-red-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Aplikasi Mengalami Masalah</h1>
            <p className="text-gray-600 mb-6">Terjadi kesalahan teknis. Mohon fotokan pesan di bawah ini kepada admin/developer.</p>
            
            <div className="bg-gray-900 text-red-300 p-4 rounded text-left overflow-auto text-xs font-mono mb-6 max-h-64">
              <strong>{this.state.error && this.state.error.toString()}</strong>
              <br/><br/>
              {this.state.errorInfo && this.state.errorInfo.componentStack}
            </div>

            <button 
                onClick={() => { localStorage.clear(); window.location.href = '/'; }} 
                className="px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition shadow-lg"
            >
                Reset Aplikasi & Coba Lagi
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- 2. LOGIKA UTAMA APLIKASI ---
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

  useEffect(() => {
    // Beri jeda sedikit agar loading terasa (dan memastikan render siap)
    const timer = setTimeout(() => {
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
    return () => clearTimeout(timer);
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
        localStorage.clear(); // Bersihkan semua cache
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

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 flex-col gap-3">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <div className="text-gray-500 font-medium animate-pulse">Sedang memuat aplikasi...</div>
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
    <ErrorBoundary>
      <BrowserRouter>
          <AppContent />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;