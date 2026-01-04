import React, { useState, useEffect, useCallback } from 'react';
import Login from './Login';
import Dashboard from './Dashboard';
import ExamSimulation from './ExamSimulation';
import UploadExam from './UploadExam';
import AdminDashboard from './AdminDashboard'; 
import { MajorSelection, Confirmation, ResultSummary } from './FlowComponents';
import StudentRecap from './StudentRecap'; 
import { Loader2 } from 'lucide-react';
import './App.css';

function App() {
  const [view, setView] = useState('loading'); 
  const [userData, setUserData] = useState({ 
      name: '', username: '', role: '', 
      display1: '', display2: '', pg1: '', pg2: '', 
      choice1_id: null, choice2_id: null 
  });
  const [activeExamData, setActiveExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const updateView = (newView) => { setView(newView); localStorage.setItem('utbk_step', newView); };

  const saveSession = useCallback((user, step) => {
    if (!user) return;
    setUserData(user); updateView(step);
    localStorage.setItem('utbk_user', JSON.stringify(user));
  }, []);

  const handleLogout = useCallback(() => {
    if(window.confirm("Keluar aplikasi?")) {
        localStorage.clear();
        setUserData({ name:'', username:'', role:'', display1:'', display2:'', pg1:'', pg2:'', choice1_id:null, choice2_id:null });
        updateView('login');
    }
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setExamResult(null); setActiveExamData(null); localStorage.removeItem('current_exam_id'); updateView('dashboard');
  }, []);

  const handleSelectExam = useCallback(async (examId, isResume = false) => {
    if (!isResume) setLoading(true);
    try {
        const res = await fetch(`http://127.0.0.1:8000/exams/${examId}`);
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setActiveExamData({ ...data, id: examId }); 
        localStorage.setItem('current_exam_id', examId);
        if (!isResume) updateView('exam'); else setView('exam'); 
    } catch (err) {
        alert("Gagal memuat soal.");
        if (isResume) updateView('dashboard'); 
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const savedUserStr = localStorage.getItem('utbk_user');
    const savedStep = localStorage.getItem('utbk_step');
    const savedExamId = localStorage.getItem('current_exam_id');

    if (savedUserStr) {
      const user = JSON.parse(savedUserStr);
      if (!user.username) { localStorage.clear(); setView('login'); return; }
      setUserData(user);
      
      if (user.role === 'admin') setView('admin_dashboard');
      else if (savedStep === 'exam' && savedExamId) handleSelectExam(savedExamId, true);
      else {
         if (!user.display1) setView('select_major'); // Paksa pilih jurusan
         else if (savedStep === 'confirmation') setView('confirmation'); // Paksa konfirmasi
         else setView(savedStep || 'dashboard');
      }
    } else { setView('login'); }
  // eslint-disable-next-line
  }, []); 

  const handleLogin = (loginData) => {
    const newData = { 
        ...userData, name: loginData.name, username: loginData.username, role: loginData.role,
        display1: loginData.pilihan1 || '', display2: loginData.pilihan2 || '',
        pg1: loginData.pg1 || '', pg2: loginData.pg2 || ''
    };
    
    if (loginData.role === 'admin') {
        saveSession(newData, 'admin_dashboard');
    } else {
        if (loginData.pilihan1) saveSession(newData, 'confirmation'); // Sudah pilih -> Konfirmasi
        else saveSession(newData, 'select_major'); // Belum -> Pilih Jurusan
    }
  };

  const handleMajorSelected = async (selectionData) => {
    const newData = { 
        ...userData, display1: selectionData.display1, display2: selectionData.display2,
        pg1: selectionData.pg1, pg2: selectionData.pg2,
        choice1_id: selectionData.choice1_id, choice2_id: selectionData.choice2_id
    };
    saveSession(newData, 'confirmation');
    try {
        await fetch('http://127.0.0.1:8000/users/select-major', {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ username: userData.username, choice1_id: selectionData.choice1_id, choice2_id: selectionData.choice2_id })
        });
    } catch (err) {}
  };

  const handleStartApp = () => updateView('dashboard');
  const handleSubmitExam = (answers) => {
    setLoading(true);
    fetch(`http://127.0.0.1:8000/exams/${activeExamData.id}/submit`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, username: userData.username })
    }).then(res=>res.json()).then(data => {
        setExamResult(data); updateView('result');
        localStorage.removeItem('current_exam_id'); localStorage.removeItem('saved_answers'); localStorage.removeItem('saved_timer');
    }).catch(() => alert("Gagal kirim.")).finally(() => setLoading(false));
  };

  if (view === 'loading') return null;

  return (
    <div className="App font-sans text-gray-800">
      {loading && <div className="fixed inset-0 bg-white/90 z-50 flex items-center justify-center"><Loader2 size={48} className="animate-spin text-blue-600"/></div>}
      
      {view === 'login' && <Login onLogin={handleLogin} />}
      {view === 'admin_dashboard' && <AdminDashboard onLogout={handleLogout}/>}
      {view === 'select_major' && <MajorSelection onNext={handleMajorSelected} />}
      {view === 'confirmation' && <Confirmation userData={userData} onStart={handleStartApp} onBack={() => saveSession(userData, 'select_major')}/>}
      
      {view === 'dashboard' && <Dashboard userName={userData.name} onSelectExam={handleSelectExam} onLogout={handleLogout} onGoToRecap={() => updateView('student_recap')} />}
      {view === 'student_recap' && <StudentRecap username={userData.username} onBack={() => updateView('dashboard')} />}
      {view === 'upload' && <UploadExam onBack={() => updateView('admin_dashboard')} />}
      {view === 'exam' && activeExamData && <ExamSimulation examData={activeExamData} onBack={handleBackToDashboard} onSubmit={handleSubmitExam} />}
      {view === 'result' && examResult && <ResultSummary result={examResult} onBack={handleBackToDashboard} />}
    </div>
  );
}
export default App;