import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Dashboard from './Dashboard';
import ExamSimulation from './ExamSimulation';
import UploadExam from './UploadExam';
import AdminDashboard from './AdminDashboard'; 
import { MajorSelection, Confirmation } from './FlowComponents';
import StudentRecap from './StudentRecap'; 
import { Loader2 } from 'lucide-react';
import './App.css';

// --- PENGAMAN DATA (SAFE PARSE) ---
const getSafeUserData = () => {
  try {
    const saved = localStorage.getItem('utbk_user');
    if (!saved) return null;
    return JSON.parse(saved);
  } catch (e) {
    console.error("Data user rusak, mereset...", e);
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
  }, [userData, navigate]);

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
        if (loginData.pilihan1) navigate('/confirmation');
        else navigate('/select-major');
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

// --- ERROR BOUNDARY ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("Uncaught error:", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center p-4 bg-gray-50 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan Aplikasi</h1>
          <p className="text-gray-600 mb-6">Jangan khawatir, data Anda aman. Silakan muat ulang.</p>
          <div className="flex gap-4">
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded font-bold">Muat Ulang</button>
            <button onClick={() => { localStorage.clear(); window.location.href = '/'; }} className="px-6 py-2 bg-gray-600 text-white rounded">Reset Sesi (Logout)</button>
          </div>
          <pre className="mt-8 p-4 bg-gray-200 rounded text-xs text-left text-red-800 overflow-auto max-w-lg">
            {this.state.error && this.state.error.toString()}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

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