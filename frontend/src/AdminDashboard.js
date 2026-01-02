import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, FileText, Users, LogOut, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Search, X, Filter, Clock, Key, Building2, PieChart, FileCode, Info, Menu, PenTool, BookOpen } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXAM_ORDER = ["PU", "PBM", "PPU", "PK", "LBI", "LBE", "PM"];

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [allowedUsers, setAllowedUsers] = useState('');
  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]);
  const [majors, setMajors] = useState([]); 
  const [isReleased, setIsReleased] = useState(false);
  const [isMajorSelectionEnabled, setIsMajorSelectionEnabled] = useState(true);
  
  const [isRandom, setIsRandom] = useState(true); 
  const [isFlexible, setIsFlexible] = useState(false); 
  
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [previewData, setPreviewData] = useState(null); 
  const [analysisData, setAnalysisData] = useState(null); 
  const [activeAnalysisId, setActiveAnalysisId] = useState(null); 
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false); 
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditAccessModal, setShowEditAccessModal] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState(null);
  const [editAccessUsers, setEditAccessUsers] = useState([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [selectedWhitelist, setSelectedWhitelist] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student' });
  const [newMajor, setNewMajor] = useState({ university: '', name: '', passing_grade: '' }); 
  const [selectedIds, setSelectedIds] = useState([]); 
  const [selectedRecapPeriod, setSelectedRecapPeriod] = useState('');

  // --- MANUAL INPUT STATE ---
  const [showManualInput, setShowManualInput] = useState(false);
  const [activeExamIdForManual, setActiveExamIdForManual] = useState(null);
  const [manualQ, setManualQ] = useState({
      text: '', type: 'multiple_choice', difficulty: 1.0, reading_material: '', explanation: '',
      label_true: 'Benar', label_false: 'Salah',
      options: []
  });

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  };

  const fetchPeriods = useCallback(() => { fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[])); }, []);
  const fetchUsers = useCallback(() => { fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>setUsers(Array.isArray(d)?d:[])); }, []);
  const fetchMajors = useCallback(() => { fetch(`${API_URL}/majors`).then(r=>r.json()).then(d=>setMajors(Array.isArray(d)?d:[])); }, []);
  const fetchRecap = useCallback(() => {
      const url = selectedRecapPeriod ? `${API_URL}/admin/recap?period_id=${selectedRecapPeriod}` : `${API_URL}/admin/recap`;
      fetch(url).then(r=>r.json()).then(d=>setRecap(Array.isArray(d)?d:[]));
  }, [selectedRecapPeriod]);
  const fetchConfigs = useCallback(() => {
      fetch(`${API_URL}/config/release`).then(r=>r.json()).then(d=>setIsReleased(d.value === 'true'));
      fetch(`${API_URL}/config/enable_major_selection`).then(r=>r.json()).then(d=>setIsMajorSelectionEnabled(d.value === 'true'));
  }, []);

  useEffect(() => { 
      fetchUsers(); fetchConfigs(); 
      if (tab === 'periods') fetchPeriods(); 
      if (tab === 'recap') { fetchPeriods(); fetchRecap(); } 
      if (tab === 'majors') fetchMajors(); 
  }, [tab, fetchPeriods, fetchUsers, fetchRecap, fetchConfigs, fetchMajors]);

  // --- ACTIONS ---
  const togglePeriodActive = (id, currentStatus) => { fetch(`${API_URL}/admin/periods/${id}/toggle`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!currentStatus})}).then(fetchPeriods); };
  const togglePeriodSubmit = (id, currentStatus) => { fetch(`${API_URL}/admin/periods/${id}/toggle-submit`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!currentStatus})}).then(fetchPeriods); };
  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) fetch(`${API_URL}/admin/periods/${id}`, {method:'DELETE'}).then(fetchPeriods); };
  
  const handleCreatePeriod = (e) => { 
      e.preventDefault(); 
      if (!newPeriodName) return;
      let allowed = selectedWhitelist.length > 0 ? selectedWhitelist.join(',') : (allowedUsers.trim() || null);
      fetch(`${API_URL}/admin/periods`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newPeriodName, allowed_usernames: allowed, is_random: isRandom, is_flexible: isFlexible, exam_type: "UTBK" })
      }).then(()=>{ alert("Sukses"); setNewPeriodName(''); setAllowedUsers(''); setSelectedWhitelist([]); fetchPeriods(); });
  };

  const handleAddUser = () => { fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(()=>{ alert("User Added"); fetchUsers(); setNewUser({...newUser, username:''}); }); };
  const handleBulkDelete = () => { if(window.confirm("Hapus terpilih?")) fetch(`${API_URL}/admin/users/delete-bulk`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_ids:selectedIds})}).then(fetchUsers); };
  const handleBulkUpload = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchUsers();}) };
  const handleChangePassword = (uid) => { const p = prompt("Pass Baru:"); if(p) fetch(`${API_URL}/admin/users/${uid}/password`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({new_password:p})}).then(()=>alert("Diganti")); };

  const handleAddMajor = () => { fetch(`${API_URL}/majors`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newMajor)}).then(()=>{ alert("Jurusan Added"); fetchMajors(); }); };
  const handleDeleteMajor = (id) => { fetch(`${API_URL}/majors/${id}`, {method:'DELETE'}).then(fetchMajors); };
  const handleBulkUploadMajors = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/majors/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchMajors();}) };

  const handlePreviewExam = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r=>r.json()).then(d=>{setPreviewData(d); setShowPreview(true);}); };
  const handleDeleteQuestion = (qid) => { if(window.confirm("Hapus soal ini?")) fetch(`${API_URL}/admin/questions/${qid}`, { method: 'DELETE' }).then(() => { handlePreviewExam(previewData.id || activeExamIdForManual); fetchPeriods(); }); };
  const handleUploadQuestion = (eid, f) => { const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchPeriods();}); };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('landscape'); 
    doc.text("REKAP NILAI UTBK", 14, 15);
    const tableColumn = ["Nama", "Username", ...EXAM_ORDER, "Avg", "Status"];
    const tableRows = recap.map(r => [r.full_name, r.username, ...EXAM_ORDER.map(k=>r[k]||0), r.average, r.status]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('rekap.pdf');
  };
  const handleDownloadExcel = () => window.open(`${API_URL}/admin/recap/download?period_id=${selectedRecapPeriod}`, '_blank');
  const handleDownloadTemplate = () => window.open(`${API_URL}/admin/download-template`, '_blank');
  const handleShowAnalysis = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/analysis`).then(r => r.json()).then(d => { setAnalysisData(d); setActiveAnalysisId(eid); setShowAnalysis(true); }); };
  const handleDownloadAnalysisExcel = () => { if (activeAnalysisId) window.open(`${API_URL}/admin/exams/${activeAnalysisId}/analysis/download`, '_blank'); };
  const handleResetResult = (uid, eid) => { if(window.confirm("Reset?")) fetch(`${API_URL}/admin/reset-result`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid, exam_id:eid})}).then(fetchRecap); };
  const handleViewStudentDetail = (d) => { setSelectedStudentDetail(d); setShowDetailModal(true); };

  const toggleConfig = (k, v) => {
      const nv = !v; 
      if(k==='release_announcement') setIsReleased(nv); 
      if(k==='enable_major_selection') setIsMajorSelectionEnabled(nv);
      fetch(`${API_URL}/config/${k}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({value:nv?"true":"false"})});
  };

  const toggleUserWhitelist = (u) => { setSelectedWhitelist(selectedWhitelist.includes(u) ? selectedWhitelist.filter(x=>x!==u) : [...selectedWhitelist, u]); };
  const openEditAccess = (p) => { setEditingPeriodId(p.id); setEditAccessUsers(p.allowed_usernames ? p.allowed_usernames.split(',') : []); setShowEditAccessModal(true); };
  const toggleEditAccessUser = (u) => { setEditAccessUsers(editAccessUsers.includes(u) ? editAccessUsers.filter(x=>x!==u) : [...editAccessUsers, u]); };
  const saveEditAccess = () => { fetch(`${API_URL}/admin/periods/${editingPeriodId}/users`, {method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({allowed_usernames:editAccessUsers.join(',')})}).then(()=>{alert("Saved");setShowEditAccessModal(false);fetchPeriods();}); };

  // --- MANUAL INPUT ---
  const openManualInput = (examId) => {
      setActiveExamIdForManual(examId);
      setManualQ({ text: '', type: 'multiple_choice', difficulty: 1.0, reading_material: '', explanation: '', label_true: 'Benar', label_false: 'Salah', options: [ { label: '', is_correct: false }, { label: '', is_correct: false }, { label: '', is_correct: false }, { label: '', is_correct: false }, { label: '', is_correct: false } ] });
      setShowManualInput(true);
  };
  const handleOptionChange = (idx, field, value) => {
      const newOpts = [...manualQ.options];
      newOpts[idx][field] = value;
      if (manualQ.type === 'multiple_choice' && field === 'is_correct' && value === true) newOpts.forEach((o, i) => { if (i !== idx) o.is_correct = false; });
      setManualQ({ ...manualQ, options: newOpts });
  };
  const addOption = () => setManualQ({...manualQ, options: [...manualQ.options, {label:'', is_correct:false}]});
  const removeOption = (idx) => setManualQ({...manualQ, options: manualQ.options.filter((_,i)=>i!==idx)});
  const saveManualQuestion = () => {
      if (!manualQ.text) { alert("Isi teks soal!"); return; }
      fetch(`${API_URL}/admin/exams/${activeExamIdForManual}/manual-question`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(manualQ)}).then(()=>{ alert("Tersimpan!"); setShowManualInput(false); fetchPeriods(); });
  };

  const getStatusBadge = (s) => {
      if (s && s.startsWith('LULUS')) return <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckCircle size={12}/> {s}</span>;
      return <span className="text-red-600 font-bold text-xs flex items-center gap-1"><XCircle size={12}/> TIDAK LULUS</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans text-gray-800">
      <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
          <div className="font-bold text-lg flex items-center gap-2"><Building2 size={20}/> Admin Panel</div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-indigo-800 rounded">{isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}</button>
      </div>
      <aside className={`bg-indigo-900 text-white p-6 flex flex-col fixed md:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} mt-16 md:mt-0 shadow-xl md:shadow-none`}>
          <h1 className="text-2xl font-bold mb-8 hidden md:block">Admin Panel</h1>
          <nav className="space-y-4 flex-1">
              <button onClick={()=>{setTab('periods'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='periods'?'bg-indigo-700':''}`}><FileText size={18}/> Soal & Ujian</button>
              <button onClick={()=>{setTab('majors'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='majors'?'bg-indigo-700':''}`}><Building2 size={18}/> Manajemen Jurusan</button>
              <button onClick={()=>{setTab('users'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='users'?'bg-indigo-700':''}`}><Users size={18}/> User & Siswa</button>
              <button onClick={()=>{setTab('recap'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='recap'?'bg-indigo-700':''}`}><FileText size={18}/> Rekap Nilai</button>
          </nav>
          <div className="mt-auto pt-6 border-t border-indigo-700 space-y-3">
              <div className="text-xs font-bold text-indigo-300 uppercase">Pengaturan</div>
              <button onClick={()=>toggleConfig('enable_major_selection', isMajorSelectionEnabled)} className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition ${isMajorSelectionEnabled ? 'bg-green-600' : 'bg-red-500'}`}>Jurusan: {isMajorSelectionEnabled ? "ON" : "OFF"} {isMajorSelectionEnabled ? <Unlock size={14}/> : <Lock size={14}/>}</button>
              <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition ${isReleased ? 'bg-green-600' : 'bg-orange-500'}`}>Pengumuman: {isReleased ? "RILIS" : "TUTUP"} {isReleased ? <Unlock size={14}/> : <Lock size={14}/>}</button>
              <button onClick={onLogout} className="flex items-center gap-3 p-3 rounded hover:bg-red-600 bg-indigo-800 mt-4"><LogOut size={18}/> Keluar</button>
          </div>
      </aside>
      
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative h-screen">
        {/* --- MODALS --- */}
        {showManualInput && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
                        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><PenTool/> Input Soal Lengkap</h3>
                        <button onClick={()=>setShowManualInput(false)}><X/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="font-bold text-sm">Tipe Soal</label>
                            <select className="w-full border p-2 rounded" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type: e.target.value})}>
                                <option value="multiple_choice">Pilihan Ganda (1 Jawaban)</option>
                                <option value="complex">Pilihan Ganda Kompleks</option>
                                <option value="table_boolean">Tabel (Benar/Salah atau Custom)</option>
                                <option value="short_answer">Isian Singkat</option>
                            </select></div>
                            <div><label className="font-bold text-sm">Tingkat Kesulitan (IRT)</label><input type="number" step="0.1" className="w-full border p-2 rounded" value={manualQ.difficulty} onChange={e=>setManualQ({...manualQ, difficulty:parseFloat(e.target.value)})}/></div>
                        </div>
                        <div><label className="font-bold text-sm flex gap-2"><BookOpen size={16}/> Wacana (Opsional)</label><textarea className="w-full border p-2 rounded bg-yellow-50 h-24" placeholder="Teks bacaan..." value={manualQ.reading_material} onChange={e=>setManualQ({...manualQ, reading_material:e.target.value})}/></div>
                        <div><label className="font-bold text-sm">Pertanyaan (Support LaTeX $...$)</label><textarea className="w-full border p-2 rounded h-24" placeholder="Tulis soal..." value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/>
                        <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded border"><strong>Preview:</strong> {renderText(manualQ.text || "...")}</div></div>
                        <div className="bg-gray-50 p-4 rounded border">
                            {manualQ.type === 'table_boolean' ? (
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <input className="border p-1 w-1/2 text-center font-bold" placeholder="Label Kiri" value={manualQ.label_true} onChange={e=>setManualQ({...manualQ, label_true:e.target.value})}/>
                                        <input className="border p-1 w-1/2 text-center font-bold" placeholder="Label Kanan" value={manualQ.label_false} onChange={e=>setManualQ({...manualQ, label_false:e.target.value})}/>
                                    </div>
                                    {manualQ.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2 mb-2"><input className="flex-1 border p-2 rounded" placeholder={`Pernyataan ${i+1}`} value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/>
                                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)}/> <span className="text-xs font-bold text-indigo-600">{opt.is_correct ? manualQ.label_true : manualQ.label_false}</span></label>
                                            <button onClick={()=>removeOption(i)} className="text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                    <button onClick={addOption} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">+ Tambah Baris</button>
                                </div>
                            ) : manualQ.type === 'short_answer' ? (
                                <div><label className="font-bold text-sm">Kunci Jawaban</label><input className="w-full border p-2 rounded" placeholder="Contoh: 45" value={manualQ.options[0]?.label || ''} onChange={e=>{const o=[...manualQ.options]; if(!o[0])o[0]={label:'',is_correct:true}; o[0].label=e.target.value; o[0].is_correct=true; setManualQ({...manualQ, options:o})}}/></div>
                            ) : (
                                <div>
                                    {manualQ.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2 mb-2"><span className="w-6 font-bold text-center">{String.fromCharCode(65+i)}</span><input className="flex-1 border p-2 rounded" value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/><input type="checkbox" className="w-5 h-5" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)}/><button onClick={()=>removeOption(i)} className="text-red-500"><Trash2 size={16}/></button></div>
                                    ))}
                                    <button onClick={addOption} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">+ Tambah Opsi</button>
                                </div>
                            )}
                        </div>
                        <div><label className="font-bold text-sm text-green-700">Pembahasan</label><textarea className="w-full border p-2 rounded h-24 bg-green-50" placeholder="Tulis pembahasan..." value={manualQ.explanation} onChange={e=>setManualQ({...manualQ, explanation:e.target.value})}/></div>
                    </div>
                    <div className="p-4 border-t text-right bg-gray-50"><button onClick={saveManualQuestion} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold">Simpan Soal</button></div>
                </div>
            </div>
        )}

        {showPreview && previewData && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between bg-gray-50"><h3>Preview: {previewData.title}</h3><button onClick={()=>setShowPreview(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {previewData.questions.map((q,i)=>(
                            <div key={q.id} className="border p-4 rounded bg-gray-50 relative group">
                                <button onClick={()=>handleDeleteQuestion(q.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2/></button>
                                <div className="font-bold text-indigo-700">Soal {i+1} <span className="text-xs bg-gray-200 px-2 rounded text-gray-600">{q.type}</span></div>
                                {q.reading_material && <div className="bg-yellow-50 p-2 text-sm italic my-2 border-l-4 border-yellow-400">{renderText(q.reading_material)}</div>}
                                <div className="my-2">{renderText(q.text)}</div>
                                <div className="ml-4 space-y-1">{q.options.map((o, idx)=><div key={idx} className={o.is_correct?'text-green-600 font-bold':''}>{o.label} {o.is_correct&&'(Kunci)'}</div>)}</div>
                                {q.explanation && <div className="mt-4 bg-green-100 p-3 rounded text-sm text-green-800"><strong>Pembahasan:</strong> {renderText(q.explanation)}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {showAnalysis && analysisData && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                 <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><div><h3 className="text-xl font-bold">Analisis</h3></div><div className="flex items-center gap-2"><button onClick={handleDownloadAnalysisExcel} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2"><Download size={14}/> Excel</button><button onClick={()=>setShowAnalysis(false)} className="bg-gray-200 p-1.5 rounded hover:bg-gray-300"><X size={18}/></button></div></div>
                 <div className="flex-1 overflow-y-auto p-6"><div className="overflow-x-auto"><table className="w-full text-sm text-left border rounded-lg"><thead className="bg-indigo-50 text-indigo-900 font-bold"><tr><th className="p-3 border-b">No</th><th className="p-3 border-b">Soal</th><th className="p-3 border-b text-center">Diff</th><th className="p-3 border-b text-center">Benar</th><th className="p-3 border-b text-center">%</th></tr></thead><tbody>{analysisData.stats.map((item, idx) => (<tr key={item.id} className="hover:bg-gray-50 border-b"><td className="p-3 text-center">{idx + 1}</td><td className="p-3 text-gray-700 min-w-[200px]">{renderText(item.text)}</td><td className="p-3 text-center text-blue-600">{item.difficulty}</td><td className="p-3 text-center text-green-600">{item.correct}/{item.attempts}</td><td className="p-3 text-center">{item.percentage}%</td></tr>))}</tbody></table></div></div>
             </div></div>
        )}

        {showEditAccessModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col h-[70vh]">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><h3 className="font-bold">Edit Akses</h3><button onClick={()=>setShowEditAccessModal(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">{users.filter(u=>u.role==='student').map(u=>(<label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 border rounded cursor-pointer"><input type="checkbox" checked={editAccessUsers.includes(u.username)} onChange={()=>toggleEditAccessUser(u.username)}/><div><div className="font-bold text-sm">{u.full_name}</div><div className="text-xs text-gray-400">{u.username}</div></div></label>))}</div>
                    <div className="p-4 border-t text-right"><button onClick={saveEditAccess} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Simpan</button></div>
                </div>
            </div>
        )}

        {showDetailModal && selectedStudentDetail && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[70vh]">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><div><h3 className="text-lg font-bold text-indigo-900">Rincian</h3><p className="text-sm text-gray-500">{selectedStudentDetail.full_name}</p></div><button onClick={()=>setShowDetailModal(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">{EXAM_ORDER.map(code => {const wrongList = selectedStudentDetail.details ? selectedStudentDetail.details[code] : null; return (<div key={code} className="border rounded-lg p-4 bg-gray-50"><div className="flex justify-between items-center mb-2"><span className="font-bold text-indigo-800">{code}</span>{wrongList ? (<span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">Salah {wrongList.split(',').length}</span>) : (<span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-bold">Benar Semua</span>)}</div><div className="text-sm text-gray-700">{wrongList ? (<div><span className="font-bold text-red-600 mr-2">No Salah:</span><span className="font-mono tracking-widest">{wrongList.replace(/,/g, ', ')}</span></div>) : <span className="italic text-gray-400">-</span>}</div></div>);})}</div>
                </div>
            </div>
        )}

        {showUserModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col h-[70vh]">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><h3 className="font-bold">Pilih Peserta</h3><button onClick={()=>setShowUserModal(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">{users.filter(u=>u.role==='student').map(u=>(<label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 border rounded cursor-pointer"><input type="checkbox" checked={selectedWhitelist.includes(u.username)} onChange={()=>toggleUserWhitelist(u.username)}/><div><div className="font-bold text-sm">{u.full_name}</div><div className="text-xs text-gray-400">{u.username}</div></div></label>))}</div>
                    <div className="p-4 border-t text-right"><button onClick={()=>setShowUserModal(false)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Selesai</button></div>
                </div>
            </div>
        )}

        {/* --- MAIN DASHBOARD CONTENT --- */}
        {tab === 'majors' && (
            <div><h2 className="text-2xl font-bold mb-6">Manajemen Jurusan</h2>
            <div className="bg-white p-6 rounded shadow mb-6 border-l-4 border-indigo-500"><div className="flex flex-col md:flex-row gap-2 items-end"><div className="flex-1 w-full"><label className="text-xs font-bold text-gray-500">Universitas</label><input className="w-full p-2 border rounded" placeholder="UI" value={newMajor.university} onChange={e=>setNewMajor({...newMajor, university:e.target.value})}/></div><div className="flex-[2] w-full"><label className="text-xs font-bold text-gray-500">Jurusan</label><input className="w-full p-2 border rounded" placeholder="Kedokteran" value={newMajor.name} onChange={e=>setNewMajor({...newMajor, name:e.target.value})}/></div><div className="w-full md:w-32"><label className="text-xs font-bold text-gray-500">PG</label><input type="number" step="0.01" className="w-full p-2 border rounded" placeholder="650" value={newMajor.passing_grade} onChange={e=>setNewMajor({...newMajor, passing_grade:e.target.value})}/></div><button onClick={handleAddMajor} className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded font-bold h-[42px]">Simpan</button></div><div className="mt-4 pt-4 border-t"><label className="text-blue-600 cursor-pointer text-sm hover:underline font-bold flex items-center gap-2"><Upload size={16}/> Upload Excel Jurusan<input type="file" hidden accept=".xlsx" onChange={handleBulkUploadMajors}/></label></div></div>
            <div className="bg-white shadow rounded overflow-hidden overflow-x-auto"><div className="max-h-[600px] overflow-y-auto"><table className="w-full text-sm text-left"><thead className="bg-indigo-50 text-indigo-900 sticky top-0"><tr><th className="p-4">Universitas</th><th className="p-4">Jurusan</th><th className="p-4">PG</th><th className="p-4 text-center">Aksi</th></tr></thead><tbody className="divide-y">{majors.map(m=>(<tr key={m.id} className="hover:bg-gray-50"><td className="p-4 font-bold text-gray-700">{m.university}</td><td className="p-4">{m.name}</td><td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{m.passing_grade}</span></td><td className="p-4 text-center"><button onClick={()=>handleDeleteMajor(m.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div></div>
            </div>
        )}

        {tab === 'periods' && (
            <div><h2 className="text-2xl font-bold mb-6">Manajemen Soal</h2><div className="flex justify-end mb-4"><button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded font-bold shadow"><Download size={18}/> Template</button></div>
            <div className="bg-white p-6 rounded shadow mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full"><label className="text-sm font-bold text-gray-600">Nama Periode</label><input className="w-full p-2 border rounded" value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)}/></div>
                    <div className="w-full md:w-1/3"><label className="text-sm font-bold text-gray-600">Akses</label><div onClick={()=>setShowUserModal(true)} className="w-full p-2 border rounded bg-gray-50 cursor-pointer flex justify-between items-center"><span className="text-sm text-gray-600">{selectedWhitelist.length>0?`${selectedWhitelist.length} Peserta`:"Semua (Public)"}</span><Users size={16}/></div></div>
                    <div className="w-full md:w-auto flex flex-col gap-2 justify-center items-start">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isRandom} onChange={e => setIsRandom(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded"/><span className="text-xs font-bold text-gray-700 select-none">Acak Urutan?</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={isFlexible} onChange={e => setIsFlexible(e.target.checked)} className="w-4 h-4 text-blue-600 rounded"/><span className="text-xs font-bold text-blue-800 select-none">Bebas Pilih?</span></label>
                    </div>
                    <button onClick={handleCreatePeriod} className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded font-bold">Buat</button>
                </div>
            </div>
            <div className="space-y-4">{periods.map(p=>(<div key={p.id} className="bg-white rounded shadow border overflow-hidden"><div className="p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><div className="flex gap-4 w-full md:w-auto"><button onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)}>{expandedPeriod===p.id?<ChevronUp/>:<ChevronDown/>}</button>
            <div><h3 className="font-bold">{p.name}</h3><div className="flex gap-2 text-xs flex-wrap"><span className={`px-2 py-0.5 rounded font-bold ${p.is_active?'bg-green-100 text-green-700':'bg-gray-200'}`}>{p.is_active?'PUBLIK':'DRAFT'}</span><span className={`px-2 py-0.5 rounded font-bold ${p.is_flexible?'bg-teal-100 text-teal-700':'bg-gray-200 text-gray-500'}`}>{p.is_flexible ? 'BEBAS' : 'URUT'}</span></div></div></div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto"><button onClick={()=>openEditAccess(p)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-bold flex items-center gap-2 border border-gray-300 hover:bg-gray-200"><Key size={14}/> Akses</button><button onClick={()=>togglePeriodSubmit(p.id, p.allow_submit)} className={`flex-1 md:flex-none justify-center px-3 py-1 rounded text-sm font-bold flex items-center gap-2 ${p.allow_submit?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>{p.allow_submit?<Unlock size={14}/>:<Lock size={14}/>} Submit</button><button onClick={()=>togglePeriodActive(p.id, p.is_active)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm font-bold flex items-center gap-2">{p.is_active?<EyeOff size={14}/>:<Eye size={14}/>} {p.is_active?'Sembunyi':'Tampil'}</button><button onClick={()=>handleDeletePeriod(p.id)} className="p-2 bg-red-50 text-red-600 rounded border border-red-200"><Trash2 size={16}/></button></div></div>{expandedPeriod===p.id && <div className="p-4 grid gap-3">{p.exams.map(e=>(<div key={e.id} className="border p-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3"><div><div className="font-bold">{e.title}</div><div className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {e.duration}m | {e.questions.length} Soal</div></div>
            <div className="flex gap-2 w-full md:w-auto"><button onClick={()=>openManualInput(e.id)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-teal-600 text-white rounded text-xs font-bold cursor-pointer hover:bg-teal-700 flex items-center gap-1"><PenTool size={12}/> Tulis</button><button onClick={()=>handlePreviewExam(e.id)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold flex items-center gap-1"><Search size={12}/> Lihat</button><button onClick={()=>handleShowAnalysis(e.id)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold flex items-center gap-1"><PieChart size={12}/> Analisis</button><label id={`btn-upload-${e.id}`} className="flex-1 md:flex-none justify-center px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold cursor-pointer hover:bg-blue-700 flex items-center gap-1"><Upload size={12}/> Upload<input type="file" hidden accept=".xlsx" onChange={ev=>handleUploadQuestion(e.id,ev.target.files[0])}/></label></div></div>))}</div>}</div>))}</div></div>)}

        {tab === 'users' && (<div><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">User Management</h2>{selectedIds.length>0&&<button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"><Trash2 size={16}/> Hapus {selectedIds.length}</button>}</div><div className="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-2"><input className="border p-2 rounded flex-1" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/><input className="border p-2 rounded flex-1" placeholder="Nama" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/><input className="border p-2 rounded flex-1" placeholder="Pass" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/><select className="border p-2 rounded bg-gray-50" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}><option value="student">Siswa</option><option value="admin">Admin</option></select><button onClick={handleAddUser} className="bg-green-600 text-white px-4 py-2 rounded font-bold"><Plus size={16}/></button></div><div className="mb-4"><label className="text-blue-600 cursor-pointer text-sm hover:underline"><Upload size={14} className="inline mr-1"/>Upload Excel User<input type="file" hidden accept=".xlsx" onChange={handleBulkUpload}/></label></div><div className="bg-white shadow rounded overflow-hidden overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="p-3 w-10"><input type="checkbox" onChange={e=>setSelectedIds(e.target.checked?users.map(u=>u.id):[])} checked={users.length>0&&selectedIds.length===users.length}/></th><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Username</th><th className="p-3 text-left">Role</th><th className="p-3 text-center">Aksi</th></tr></thead><tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={()=>{if(selectedIds.includes(u.id))setSelectedIds(selectedIds.filter(i=>i!==u.id));else setSelectedIds([...selectedIds,u.id])}}/></td><td className="p-3">{u.full_name}</td><td className="p-3">{u.username}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{u.role.toUpperCase()}</span></td><td className="p-3 text-center"><button onClick={()=>handleChangePassword(u.id)} className="text-gray-500 hover:text-indigo-600" title="Ganti Password"><Key size={16}/></button></td></tr>))}</tbody></table></div></div>)}
        
        {tab === 'recap' && (<div className="overflow-x-auto pb-20"><div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4"><div><h2 className="text-2xl font-bold">Rekap Nilai</h2><div className="flex items-center gap-2 mt-2"><Filter size={16} className="text-gray-500"/><select className="p-2 border rounded w-full md:w-auto" value={selectedRecapPeriod} onChange={e=>setSelectedRecapPeriod(e.target.value)}><option value="">-- Semua Periode --</option>{periods.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div></div><div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button onClick={handleDownloadPDF} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow text-sm font-bold hover:bg-red-700"><FileCode size={16}/> PDF</button>
            <button onClick={handleDownloadExcel} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border rounded shadow text-sm font-bold"><Download size={16}/> Excel</button>
            <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 text-white rounded shadow text-sm font-bold ${isReleased?'bg-green-600':'bg-orange-500'}`}>{isReleased?<Unlock size={16}/>:<Lock size={16}/>} {isReleased?'Tutup':'Rilis'}</button></div></div>
            
            <div className="md:hidden space-y-4">
                {recap.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start mb-3"><div><div className="font-bold text-gray-800 text-lg flex items-center gap-2">{r.full_name} <button onClick={()=>handleViewStudentDetail(r)} className="text-blue-600 bg-blue-50 p-1 rounded-full"><Info size={16}/></button></div><div className="text-sm text-gray-500">{r.username}</div></div><div className="text-right"><div className="text-xs text-gray-400 font-bold mb-1">RATA-RATA</div><div className="text-xl font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block">{r.average}</div></div></div>
                        <div className="grid grid-cols-4 gap-2 mb-4">{EXAM_ORDER.map(k => (<div key={k} className="text-center bg-gray-50 p-2 rounded"><div className="text-[10px] font-bold text-gray-500">{k}</div><div className="font-bold text-gray-700">{r[k]||0}</div></div>))}</div>
                        <div className="flex justify-between items-center border-t pt-3"><div>{getStatusBadge(r.status)}</div><div className="flex gap-1 flex-wrap justify-end max-w-[50%]">{r.completed_exams.map(e => (<button key={e.exam_id} onClick={()=>handleResetResult(r.id,e.exam_id)} className="px-2 py-1 bg-red-100 text-red-600 text-[10px] rounded font-bold border border-red-200">Reset {e.code}</button>))}</div></div>
                    </div>
                ))}
            </div>

            <div className="hidden md:block bg-white shadow rounded overflow-hidden border overflow-x-auto">
            <table className="w-full text-sm text-left"><thead className="bg-indigo-900 text-white"><tr><th className="p-3" rowSpan="2">Nama</th><th className="p-2 text-center bg-indigo-800" colSpan="7">Skor IRT</th><th className="p-3 text-center bg-blue-900" rowSpan="2">Avg</th><th className="p-3 bg-indigo-800" rowSpan="2">Ket</th><th className="p-3 bg-red-900" rowSpan="2">Reset</th></tr>
            <tr>{EXAM_ORDER.map(s=><th key={s} className="p-1 text-center text-xs bg-indigo-700">{s}</th>)}</tr>
            </thead><tbody className="divide-y">{recap.map((r,i)=>(<tr key={i} className="hover:bg-gray-50">
            <td className="p-3"><div className="flex items-center gap-2"><button onClick={()=>handleViewStudentDetail(r)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1 rounded transition" title="Lihat Rincian Jawaban Salah"><Info size={16}/></button><div><div className="font-bold text-gray-800">{r.full_name}</div><div className="text-xs text-gray-400 font-normal">{r.username}</div></div></div></td>
            {EXAM_ORDER.map(k=><td key={k} className="p-2 text-center text-gray-600">{r[k]||0}</td>)}
            <td className="p-3 text-center font-bold text-blue-700 bg-blue-50">{r.average}</td><td className="p-3">{getStatusBadge(r.status)}</td><td className="p-3 text-center">{r.completed_exams.map(e=><button key={e.exam_id} onClick={()=>handleResetResult(r.id,e.exam_id)} className="px-2 py-1 bg-red-100 text-red-600 text-[10px] rounded border border-red-200 m-0.5 hover:bg-red-600 hover:text-white">{e.code}×</button>)}</td></tr>))}</tbody></table></div></div>)}
      </main>
    </div>
  );
};
export default AdminDashboard;