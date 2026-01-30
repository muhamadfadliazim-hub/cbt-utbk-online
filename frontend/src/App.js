import React, { useState, useEffect } from 'react';
import Login from './Login';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import ExamSimulation from './ExamSimulation';
import { MajorSelection, Confirmation, ResultSummary } from './FlowComponents';
import { API_URL } from './config';

function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('cbt_user')));
  const [activePage, setActivePage] = useState('dashboard'); 
  const [examData, setExamData] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [examQueue, setExamQueue] = useState([]); // ANTRIAN MARATON

  useEffect(() => {
    if (user) localStorage.setItem('cbt_user', JSON.stringify(user));
    else localStorage.removeItem('cbt_user');
  }, [user]);

  const handleLogin = (userData) => { setUser(userData); setActivePage('dashboard'); };
  const handleLogout = () => { setUser(null); setActivePage('login'); setExamData(null); setExamQueue([]); localStorage.clear(); };

  // FUNGSI UNTUK MEMULAI UJIAN (SATUAN ATAU MARATON)
  const handleStartExamFlow = (examOrList) => {
    if ((!user.choice1_id || user.choice1_id === 0) && user.role === 'student') {
        setActivePage('select_major'); return;
    }
    // JIKA LIST (MARATON), MASUKKAN KE ANTRIAN
    if (Array.isArray(examOrList)) {
        const todo = examOrList.filter(e => !e.is_done);
        if (todo.length === 0) return alert("Semua ujian di periode ini sudah dikerjakan!");
        setExamQueue(todo);
        loadExam(todo[0].id);
    } else {
        // JIKA SATUAN
        setExamQueue([]);
        loadExam(examOrList);
    }
  };

  const loadExam = async (examId) => {
      try {
          const res = await fetch(`${API_URL}/exams/${examId}`);
          if (!res.ok) throw new Error("Gagal load soal");
          const data = await res.json();
          setExamData(data);
          setActivePage('confirmation');
      } catch (e) { alert(e.message); }
  };

  const handleConfirmStart = () => { setActivePage('exam'); };

  const handleSubmitExam = async (answers) => {
    try {
        const res = await fetch(`${API_URL}/exams/${examData.id}/submit`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ username: user.username, answers })
        });
        const result = await res.json();
        
        // CEK APAKAH ADA ANTRIAN MARATON
        if (examQueue.length > 1) {
            const nextQueue = examQueue.slice(1);
            setExamQueue(nextQueue);
            alert(`Selesai! Lanjut ke subtes berikutnya: ${nextQueue[0].title}`);
            loadExam(nextQueue[0].id); // LANGSUNG MUAT SOAL BERIKUTNYA
        } else {
            setExamResult(result); 
            setActivePage('result');
        }
    } catch(e) { alert("Gagal kirim jawaban."); }
  };

  if (!user) return <Login onLogin={handleLogin} apiUrl={API_URL} />;
  if (user.role === 'admin') return <AdminDashboard onLogout={handleLogout} apiUrl={API_URL} />;

  switch (activePage) {
    case 'select_major': return <MajorSelection onNext={() => window.location.reload()} userUsername={user.username} />;
    case 'confirmation': return <Confirmation userData={user} onStart={handleConfirmStart} onBack={()=>setActivePage('dashboard')} />;
    case 'exam': return <ExamSimulation examData={examData} onSubmit={handleSubmitExam} />;
    case 'result': return <ResultSummary result={examResult} onBack={()=>{setExamData(null); setActivePage('dashboard');}} />;
    default: return <StudentDashboard user={user} onSelectExam={handleStartExamFlow} onLogout={handleLogout} apiUrl={API_URL} />;
  }
}

export default App;