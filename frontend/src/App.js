import React, { useState, useEffect, useCallback } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import ExamSimulation from './ExamSimulation';
import UploadExam from './UploadExam';
import AdminDashboard from './AdminDashboard'; 
import { MajorSelection, Confirmation, ResultSummary } from './FlowComponents';
import StudentRecap from './StudentRecap'; 
import { Loader2 } from 'lucide-react';
import { API_URL } from './config'; 
import './App.css';

function App() {
  const [view, setView] = useState('loading'); 
  
  // Ambil data user langsung dari localStorage saat inisialisasi state
  // Ini mencegah userData bernilai null saat refresh
  const [userData, setUserData] = useState(() => {
      const saved = localStorage.getItem('utbk_user');
      return saved ? JSON.parse(saved) : null;
  });
  
  const [activeExamData, setActiveExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- 1. ROUTING & CEK SESI SAAT APLIKASI DIMULAI ---
  useEffect(() => {
    const savedStep = localStorage.getItem('utbk_step');
    const savedExamId = localStorage.getItem('current_exam_id');

    if (userData) {
      if (userData.role === 'admin') {
          setView('admin_dashboard');
      } else {
          // Logika Siswa
          if (!userData.display1) {
              setView('select_major'); 
          } else if (savedStep === 'exam' && savedExamId) {
              // Jika status masih ujian, muat ulang soal
              handleSelectExam(savedExamId, true);
          } else if (savedStep === 'result') {
              // Jika refresh di halaman hasil, kembalikan ke dashboard (karena data nilai hilang dari memori)
              setView('dashboard');
          } else if (savedStep === 'confirmation') {
              setView('confirmation');
          } else {
              setView('dashboard'); 
          }
      }
    } else {
        setView('login');
    }
    // eslint-disable-next-line
  }, []); 

  // --- 2. UTILITY ---
  const updateView = (newView) => { 
      setView(newView); 
      localStorage.setItem('utbk_step', newView); 
  };

  const saveSession = (user, step) => {
    setUserData(user); 
    updateView(step);
    localStorage.setItem('utbk_user', JSON.stringify(user));
  };

  // --- 3. LOGIN & LOGOUT ---
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
    
    if (loginData.role === 'admin') {
        saveSession(newData, 'admin_dashboard');
    } else {
        if (loginData.pilihan1) saveSession(newData, 'confirmation');
        else saveSession(newData, 'select_major');
    }
  };

  const handleLogout = () => {
    if(window.confirm("Keluar aplikasi?")) {
        localStorage.clear();
        setUserData(null);
        setExamResult(null);
        setActiveExamData(null);
        setView('login');
    }
  };

  // --- 4. PILIH JURUSAN ---
  const handleMajorSelected = async (selectionData) => {
    const newData = { 
        ...userData, 
        display1: selectionData.display1, display2: selectionData.display2,
        pg1: selectionData.pg1, pg2: selectionData.pg2,
        choice1_id: selectionData.choice1_id, choice2_id: selectionData.choice2_id
    };
    saveSession(newData, 'confirmation');
    try {
        await fetch(`${API_URL}/users/select-major`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: userData.username, choice1_id: selectionData.choice1_id, choice2_id: selectionData.choice2_id })
        });
    } catch (err) { console.error(err); }
  };

  // --- 5. LOGIKA UJIAN ---
  const handleStartApp = () => updateView('dashboard');

  const handleSelectExam = useCallback(async (examId, isResume = false) => {
    if (!isResume) setLoading(true);
    try {
        const res = await fetch(`${API_URL}/exams/${examId}`);
        if (!res.ok) throw new Error('Gagal memuat soal');
        const data = await res.json();
        
        setActiveExamData({ ...data, id: examId }); 
        
        if (!isResume) {
            localStorage.setItem('current_exam_id', examId);
            updateView('exam'); 
        } else {
            setView('exam');
        }
    } catch (err) {
        alert("Gagal memuat soal atau koneksi terputus.");
        updateView('dashboard'); 
    } finally { setLoading(false); }
  }, []);

  // --- [FIX] SUBMIT UJIAN ---
  const handleSubmitExam = (submissionData) => {
    setLoading(true);
    
    // Pastikan username diambil dengan benar
    const currentUser = userData || JSON.parse(localStorage.getItem('utbk_user'));
    
    if (!currentUser || !currentUser.username) {
        alert("Sesi kadaluarsa. Silakan login ulang.");
        handleLogout();
        return;
    }

    const payload = {
        answers: submissionData.answers,
        username: currentUser.username // Pastikan username terkirim
    };

    fetch(`${API_URL}/exams/${activeExamData.id}/submit`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Gagal menyimpan jawaban ke server");
        return res.json();
    })
    .then(data => {
        // SUKSES
        setExamResult(data); 
        
        // HAPUS JEJAK UJIAN AGAR TIDAK BISA BALIK
        localStorage.removeItem('current_exam_id'); 
        localStorage.removeItem('saved_answers'); 
        localStorage.removeItem('saved_timer');
        
        // Pindah ke halaman hasil
        updateView('result');
    })
    .catch((err) => {
        console.error(err);
        alert("Terjadi kesalahan saat mengirim jawaban. Cek koneksi Anda.");
        // Jangan clear storage jika gagal, agar siswa bisa coba submit lagi
    })
    .finally(() => {
        setLoading(false);
    });
  };

  const handleBackToDashboard = () => {
    setExamResult(null); 
    setActiveExamData(null); 
    updateView('dashboard');
  };

  if (view === 'loading') return null;

  return (
    <div className="App font-sans text-gray-800">
      {/* LOADING OVERLAY */}
      {loading && <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center"><Loader2 size={48} className="animate-spin text-blue-600"/></div>}
      
      {view === 'login' && <Login onLogin={handleLogin} />}
      
      {view === 'admin_dashboard' && <AdminDashboard onLogout={handleLogout}/>}
      
      {view === 'select_major' && <MajorSelection onNext={handleMajorSelected} onLogout={handleLogout}/>}
      
      {view === 'confirmation' && <Confirmation userData={userData} onStart={handleStartApp} onBack={() => saveSession(userData, 'select_major')}/>}
      
      {view === 'dashboard' && (
        <Dashboard 
            userName={userData?.name} 
            onSelectExam={handleSelectExam} 
            onLogout={handleLogout} 
            onGoToRecap={() => updateView('student_recap')} 
        />
      )}

      {view === 'student_recap' && <StudentRecap username={userData?.username} onBack={() => updateView('dashboard')} />}
      
      {view === 'upload' && <UploadExam onBack={() => updateView('admin_dashboard')} />}
      
      {view === 'exam' && activeExamData && (
        <ExamSimulation 
            examData={activeExamData} 
            onSubmit={handleSubmitExam} 
            onBack={handleBackToDashboard} 
        />
      )}
      
      {/* TAMPILAN HASIL (Mencegah Blank) */}
      {view === 'result' && (
          examResult ? (
            <ResultSummary 
                result={examResult} 
                onBack={handleBackToDashboard} 
            />
          ) : (
            // Fallback jika data belum siap tapi view sudah result
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="animate-spin text-indigo-600 mr-2"/> Memproses Hasil...
            </div>
          )
      )}
    </div>
  );
}

export default App;