import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import ExamSimulation from './ExamSimulation';
import UploadExam from './UploadExam';
import AdminDashboard from './AdminDashboard'; 
import { MajorSelection, Confirmation } from './FlowComponents';
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

// Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("APP ERROR:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-red-50 p-4">
            <div className="text-center">
                <AlertTriangle className="mx-auto text-red-600 mb-4" size={48}/>
                <h2 className="text-xl font-bold text-gray-800">Terjadi Kesalahan</h2>
                <p className="text-gray-600 mb-4">Aplikasi mengalami kendala teknis.</p>
                <button onClick={() => { localStorage.clear(); window.location.href='/'; }} className="px-4 py-2 bg-red-600 text-white rounded shadow">Reset Aplikasi</button>
            </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- APP CONTENT ---
const AppContent = () => {
  const navigate = useNavigate(); // AMAN: Karena sudah dibungkus Router di index.js
  const [userData, setUserData] = useState(getSafeUserData);
  const [loading, setLoading] = useState(true);

  // Cek Status Login
  useEffect(() => {
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

        <Route path="/exam/:examId" element={userData ? <ExamSimulation /> : <Navigate to="/login" />} />
        <Route path="/recap" element={userData ? <StudentRecap username={userData.username} onBack={() => navigate('/dashboard')} /> : <Navigate to="/login" />} />

        <Route path="*" element={<Navigate to={userData ? "/" : "/login"} />} />
    </Routes>
  );
};

function App() {
  return (
    <ErrorBoundary>
        {/* HAPUS BrowserRouter dari sini */}
        <AppContent />
    </ErrorBoundary>
  );
}

export default App;