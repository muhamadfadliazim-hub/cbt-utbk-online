import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import ExamSimulation from './ExamSimulation';
import { MajorSelection, Confirmation, ResultSummary } from './FlowComponents';

const API_URL = "http://127.0.0.1:8000"; 

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('cbt_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activePage, setActivePage] = useState('dashboard'); 
  const [examData, setExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [examQueue, setExamQueue] = useState([]); 

  useEffect(() => {
    if (user) localStorage.setItem('cbt_user', JSON.stringify(user));
    else localStorage.removeItem('cbt_user');
  }, [user]);

  const handleLogin = (userData) => { setUser(userData); setActivePage('dashboard'); };
  const handleLogout = () => { 
      setUser(null); setActivePage('login'); setExamData(null); setExamQueue([]);
      localStorage.removeItem('saved_answers'); localStorage.removeItem('saved_timer'); localStorage.removeItem('cbt_user');
  };

  const handleStartExamFlow = (examOrPeriod) => {
    if ((!user.choice1_id || user.choice1_id === 0) && user.role === 'student') {
        setActivePage('select_major');
        return;
    }

    if (examOrPeriod.exams && Array.isArray(examOrPeriod.exams)) {
        // --- MODE MARATON ---
        const queue = examOrPeriod.exams.filter(e => !e.is_done);
        if (queue.length === 0) { alert("Semua tahapan selesai!"); return; }
        setExamQueue(queue);
        loadExam(queue[0].id, 'confirmation'); // Load pertama pakai konfirmasi
    } else {
        // --- MODE BIASA ---
        setExamQueue([]); 
        loadExam(examOrPeriod.id, 'confirmation');
    }
  };

  const loadExam = (examId, targetPage) => {
      fetch(`${API_URL}/exams/${examId}`)
        .then(r => { if(!r.ok) throw new Error("Soal tidak ditemukan"); return r.json(); })
        .then(data => { setExamData(data); setActivePage(targetPage); })
        .catch(() => alert("Gagal memuat soal."));
  };

  const handleMajorSelected = async (choices) => {
    await fetch(`${API_URL}/users/select-major`, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ username: user.username, ...choices })
    });
    setUser({ ...user, ...choices });
    alert("Jurusan disimpan!"); setActivePage('dashboard'); 
  };

  const handleStartExam = () => setActivePage('exam');

  const handleSubmitExam = async (answers) => {
    try {
        const res = await fetch(`${API_URL}/exams/${examData.id}/submit`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ username: user.username, answers })
        });
        const result = await res.json();
        
        localStorage.removeItem('saved_answers');
        localStorage.removeItem('saved_timer');
        
        if (examQueue.length > 1) {
            const nextQueue = examQueue.slice(1); 
            setExamQueue(nextQueue);
            // DIRECT KE EXAM TANPA KONFIRMASI LAGI
            loadExam(nextQueue[0].id, 'exam'); 
        } else {
            setExamResult(result); 
            setActivePage('result');
        }
    } catch(e) { alert("Gagal kirim jawaban."); }
  };

  if (!user) return <Login onLogin={handleLogin} apiUrl={API_URL} />;
  if (user.role === 'admin') return <AdminDashboard onLogout={handleLogout} apiUrl={API_URL} />;

  switch (activePage) {
    case 'select_major': return <MajorSelection onNext={handleMajorSelected} />;
    case 'confirmation': return <Confirmation userData={user} onStart={handleStartExam} onBack={()=>setActivePage('dashboard')} />;
    case 'exam': return <ExamSimulation examData={examData} onSubmit={handleSubmitExam} />;
    case 'result': return <ResultSummary result={examResult} onBack={()=>{setExamData(null); setActivePage('dashboard');}} />;
    default: return <StudentDashboard user={user} onSelectExam={handleStartExamFlow} onLogout={handleLogout} apiUrl={API_URL} />;
  }
}

export default App;