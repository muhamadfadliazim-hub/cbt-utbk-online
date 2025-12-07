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
  // State Utama
  const [view, setView] = useState('loading'); 
  const [userData, setUserData] = useState(null);
  
  // State Ujian
  const [activeExamData, setActiveExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --- 1. INISIALISASI & CEK SESI ---
  useEffect(() => {
    const savedUserStr = localStorage.getItem('utbk_user');
    const savedStep = localStorage.getItem('utbk_step');
    const savedExamId = localStorage.getItem('current_exam_id');

    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      setUserData(user);
      
      // Routing Logika
      if (user.role === 'admin') {
          setView('admin_dashboard');
      } else {
          // Logika Siswa
          if (!user.display1) {
              setView('select_major'); // Belum pilih jurusan
          } else if (savedStep === 'exam' && savedExamId) {
              // Sedang ujian? Cek validitas
              handleSelectExam(savedExamId, true);
          } else if (savedStep === 'result') {
              // Jika refresh di halaman hasil, kembalikan ke dashboard (karena data result di-memory hilang)
              setView('dashboard');
              // Opsional: Bisa fetch ulang result terakhir dari backend jika mau persistent
          } else if (savedStep === 'confirmation') {
              setView('confirmation');
          } else {
              setView('dashboard'); // Default
          }
      }
    } else {
        setView('login');
    }
    setLoading(false);
  // eslint-disable-next-line
  }, []); 

  // --- 2. FUNGSI UPDATE VIEW ---
  const updateView = (newView) => { 
      setView(newView); 
      localStorage.setItem('utbk_step', newView); 
  };

  const saveSession = (user, step) => {
    setUserData(user); 
    updateView(step);
    localStorage.setItem('utbk_user', JSON.stringify(user));
  };

  // --- 3. HANDLER LOGIN & LOGOUT ---
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

  // --- 4. HANDLER JURUSAN ---
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

  // --- 5. HANDLER UJIAN ---
  const handleStartApp = () => updateView('dashboard');

  const handleSelectExam = useCallback(async (examId, isResume = false) => {
    if (!isResume) setLoading(true);
    try {
        const res = await fetch(`${API_URL}/exams/${examId}`);
        if (!res.ok) throw new Error('Failed load exam');
        const data = await res.json();
        
        setActiveExamData({ ...data, id: examId }); 
        
        if (!isResume) {
            // Mulai ujian baru
            localStorage.setItem('current_exam_id', examId);
            updateView('exam'); 
        } else {
            // Resume (refresh page)
            setView('exam');
        }
    } catch (err) {
        alert("Gagal memuat soal atau koneksi terputus.");
        updateView('dashboard'); 
    } finally { setLoading(false); }
  }, []);

  // --- [FIX UTAMA] HANDLER SUBMIT UJIAN ---
  const handleSubmitExam = (submissionData) => {
    setLoading(true);
    
    // Pastikan data yang dikirim lengkap (answers + username)
    const payload = {
        answers: submissionData.answers,
        username: userData.username
    };

    fetch(`${API_URL}/exams/${activeExamData.id}/submit`, {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(res => {
        if (!res.ok) throw new Error("Gagal menyimpan jawaban");
        return res.json();
    })
    .then(data => {
        // 1. Simpan Hasil ke State
        setExamResult(data); 
        
        // 2. BERSIHKAN STORAGE (KUNCI AGAR TIDAK BISA BALIK)
        localStorage.removeItem('current_exam_id'); 
        localStorage.removeItem('saved_answers'); 
        localStorage.removeItem('saved_timer');
        
        // 3. Pindah ke Halaman Hasil
        updateView('result');
    })
    .catch((err) => {
        console.error(err);
        alert("Gagal mengirim jawaban. Mohon periksa koneksi internet Anda dan coba lagi.");
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

  // --- RENDER ---
  if (view === 'loading' || loading) {
      return (
        <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center">
            <Loader2 size={48} className="animate-spin text-blue-600"/>
        </div>
      );
  }

  return (
    <div className="App font-sans text-gray-800">
      
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
            // Pass fungsi submit yang baru
            onSubmit={handleSubmitExam} 
            onBack={handleBackToDashboard} 
        />
      )}
      
      {/* TAMPILAN HASIL (Hanya muncul jika examResult ada) */}
      {view === 'result' && examResult && (
        <ResultSummary 
            result={examResult} 
            onBack={handleBackToDashboard} 
        />
      )}
    </div>
  );
}

export default App;