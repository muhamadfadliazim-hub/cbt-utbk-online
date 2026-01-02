import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Plus, Upload, FileText, Users, LogOut, Lock, Unlock, Eye, EyeOff, 
  ChevronDown, CheckCircle, XCircle, Download, Search, X, Filter, Clock, Key, 
  Building2, PieChart, PenTool, BookOpen, Grid, LayoutDashboard, Menu, FileCode, Info, Save 
} from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXAM_ORDER = ["PU", "PBM", "PPU", "PK", "LBI", "LBE", "PM"];

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('periods');
  
  // DATA STATES (Diinisialisasi dengan Array Kosong [] agar tidak crash)
  const [periods, setPeriods] = useState([]);
  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]);
  const [majors, setMajors] = useState([]); 
  
  // FORM STATES
  const [newPeriodName, setNewPeriodName] = useState('');
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student' });
  const [newMajor, setNewMajor] = useState({ university: '', name: '', passing_grade: '' });
  
  // SETTINGS STATES
  const [isReleased, setIsReleased] = useState(false);
  const [isMajorSelectionEnabled, setIsMajorSelectionEnabled] = useState(true);
  const [isRandom, setIsRandom] = useState(true); 
  const [isFlexible, setIsFlexible] = useState(false); 
  const [examType, setExamType] = useState('UTBK');

  // UI STATES
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
  const [selectedIds, setSelectedIds] = useState([]); 
  const [selectedRecapPeriod, setSelectedRecapPeriod] = useState('');

  // MANUAL INPUT STATES
  const [showManualInput, setShowManualInput] = useState(false);
  const [activeExamIdForManual, setActiveExamIdForManual] = useState(null);
  const [manualQ, setManualQ] = useState({ text: '', type: 'multiple_choice', difficulty: 1.0, reading_material: '', explanation: '', label_true: 'Benar', label_false: 'Salah', options: [] });

  // --- HELPER RENDER TEXT ---
  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  };

  // --- DATA FETCHING (Dijamin Aman dari Crash) ---
  const fetchPeriods = useCallback(() => { 
      fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d => setPeriods(Array.isArray(d) ? d : [])); 
  }, []);
  
  const fetchUsers = useCallback(() => { 
      fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d => setUsers(Array.isArray(d) ? d : [])); 
  }, []);
  
  const fetchMajors = useCallback(() => { 
      fetch(`${API_URL}/majors`).then(r=>r.json()).then(d => setMajors(Array.isArray(d) ? d : [])); 
  }, []);
  
  const fetchRecap = useCallback(() => {
      const url = selectedRecapPeriod ? `${API_URL}/admin/recap?period_id=${selectedRecapPeriod}` : `${API_URL}/admin/recap`;
      fetch(url)
        .then(r=>r.json())
        .then(d => setRecap(Array.isArray(d) ? d : []))
        .catch(() => setRecap([])); // Safety catch
  }, [selectedRecapPeriod]);

  const fetchData = useCallback(() => {
      fetchPeriods();
      fetchUsers();
      fetchMajors();
      fetch(`${API_URL}/config/release`).then(r=>r.json()).then(d=>setIsReleased(d.value==='true'));
      fetch(`${API_URL}/config/enable_major_selection`).then(r=>r.json()).then(d=>setIsMajorSelectionEnabled(d.value==='true'));
  }, [fetchPeriods, fetchUsers, fetchMajors]);

  // Load Data on Mount & Tab Change
  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if(tab === 'recap') fetchRecap(); }, [tab, fetchRecap]);

  // --- ACTIONS ---
  const apiAction = (url, method, body, onSuccess) => {
      fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
      .then(r=>r.json()).then(d=>{ if(onSuccess) onSuccess(d); else fetchData(); }).catch(e=>alert(e.message));
  };

  // Preview & Delete Question
  const handlePreviewExam = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r=>r.json()).then(d=>{setPreviewData(d); setShowPreview(true);}); };
  const handleDeleteQuestion = (qid) => { if(window.confirm("Hapus soal ini?")) fetch(`${API_URL}/admin/questions/${qid}`, { method: 'DELETE' }).then(() => { if (previewData) handlePreviewExam(previewData.id || activeExamIdForManual); fetchPeriods(); }); };

  // Periods Management
  const handleCreatePeriod = () => { if(!newPeriodName)return; apiAction(`${API_URL}/admin/periods`, 'POST', { name: newPeriodName, allowed_usernames: selectedWhitelist.length>0 ? selectedWhitelist.join(',') : null, is_random: isRandom, is_flexible: isFlexible, exam_type: examType }, ()=>{setNewPeriodName(''); setSelectedWhitelist([]); fetchData();}); };
  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) apiAction(`${API_URL}/admin/periods/${id}`, 'DELETE'); };
  const togglePeriodActive = (id, s) => apiAction(`${API_URL}/admin/periods/${id}/toggle`, 'POST', {is_active:!s});
  const togglePeriodSubmit = (id, s) => apiAction(`${API_URL}/admin/periods/${id}/toggle-submit`, 'POST', {is_active:!s});
  
  // User Management
  const handleAddUser = () => { apiAction(`${API_URL}/admin/users`, 'POST', newUser, ()=>{alert("User Added");fetchUsers();setNewUser({...newUser, username:''});}); };
  const handleBulkDelete = () => { if(window.confirm("Hapus terpilih?")) apiAction(`${API_URL}/admin/users/delete-bulk`, 'POST', {user_ids:selectedIds}, fetchUsers); };
  const handleBulkUpload = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchUsers();}) };
  const handleChangePassword = (uid) => { const p = prompt("Pass Baru:"); if(p) apiAction(`${API_URL}/admin/users/${uid}/password`, 'PUT', {new_password:p}, ()=>alert("Diganti")); };

  // Major Management
  const handleAddMajor = () => { apiAction(`${API_URL}/majors`, 'POST', newMajor, ()=>{alert("Jurusan Added");fetchMajors();setNewMajor({university:'',name:'',passing_grade:''});}); };
  const handleDeleteMajor = (id) => { if(window.confirm("Hapus Jurusan?")) apiAction(`${API_URL}/majors/${id}`, 'DELETE', {}, fetchMajors); };
  const handleBulkUploadMajors = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/majors/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchMajors();}) };

  const handleUploadQuestion = (eid, f) => { const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchPeriods();}); };

  // PDF & Excel
  const handleDownloadPDF = () => {
    if (recap.length === 0) { alert("Tidak ada data rekap untuk didownload."); return; }
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
  const handleResetResult = (uid, eid) => { if(window.confirm("Reset Hasil Ujian Ini?")) apiAction(`${API_URL}/admin/reset-result`, 'POST', {user_id:uid, exam_id:eid}, fetchRecap); };
  const handleViewStudentDetail = (d) => { setSelectedStudentDetail(d); setShowDetailModal(true); };

  const toggleConfig = (k, v) => {
      const nv = !v; 
      if(k==='release_announcement') setIsReleased(nv); 
      if(k==='enable_major_selection') setIsMajorSelectionEnabled(nv);
      apiAction(`${API_URL}/config/${k}`, 'POST', {value:nv?"true":"false"});
  };

  const toggleUserWhitelist = (u) => { setSelectedWhitelist(selectedWhitelist.includes(u) ? selectedWhitelist.filter(x=>x!==u) : [...selectedWhitelist, u]); };
  const openEditAccess = (p) => { setEditingPeriodId(p.id); setEditAccessUsers(p.allowed_usernames ? p.allowed_usernames.split(',') : []); setShowEditAccessModal(true); };
  const toggleEditAccessUser = (u) => { setEditAccessUsers(editAccessUsers.includes(u) ? editAccessUsers.filter(x=>x!==u) : [...editAccessUsers, u]); };
  const saveEditAccess = () => { apiAction(`${API_URL}/admin/periods/${editingPeriodId}/users`, 'PUT', {allowed_usernames:editAccessUsers.join(',')}, ()=>{alert("Saved");setShowEditAccessModal(false);fetchPeriods();}); };

  const openManualInput = (eid) => { setActiveExamIdForManual(eid); setManualQ({text:'',type:'multiple_choice',difficulty:1.0,reading_material:'',explanation:'',label_true:'Benar',label_false:'Salah',options:[{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false}]}); setShowManualInput(true); };
  const handleOptionChange = (i, f, v) => { const o=[...manualQ.options]; o[i][f]=v; if(manualQ.type==='multiple_choice'&&f==='is_correct'&&v) o.forEach((x,idx)=>{if(idx!==i)x.is_correct=false}); setManualQ({...manualQ,options:o}); };
  const addOption = () => setManualQ({...manualQ, options: [...manualQ.options, {label:'', is_correct:false}]});
  const removeOption = (idx) => setManualQ({...manualQ, options: manualQ.options.filter((_,i)=>i!==idx)});
  const saveManualQuestion = () => { if(!manualQ.text)return alert("Isi Soal!"); apiAction(`${API_URL}/admin/exams/${activeExamIdForManual}/manual-question`, 'POST', manualQ, ()=>{alert("Tersimpan!"); setShowManualInput(false); fetchPeriods();}); };

  const getStatusBadge = (s) => {
      if (s && s.startsWith('LULUS')) return <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckCircle size={12}/> {s}</span>;
      return <span className="text-red-600 font-bold text-xs flex items-center gap-1"><XCircle size={12}/> TIDAK LULUS</span>;
  };

  const SidebarItem = ({ id, icon: Icon, label }) => (
      <button onClick={()=>setTab(id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${tab===id ? 'bg-white/10 text-white font-bold shadow-lg border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
          <Icon size={20}/> <span>{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      <aside className={`bg-slate-900 text-white w-72 flex flex-col fixed h-full z-20 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg"><Building2 size={24}/></div>
              <div><h1 className="font-bold text-lg leading-tight">Admin Panel</h1><span className="text-xs text-slate-400">Versi Pro 4.0</span></div>
          </div>
          <nav className="flex-1 p-4 space-y-2">
              <div className="text-xs font-bold text-slate-500 uppercase px-3 mb-2 mt-4">Menu Utama</div>
              <SidebarItem id="periods" icon={FileText} label="Manajemen Soal" />
              <SidebarItem id="users" icon={Users} label="Data Peserta" />
              <SidebarItem id="majors" icon={LayoutDashboard} label="Data Jurusan" />
              <SidebarItem id="recap" icon={PieChart} label="Rekap Nilai" />
          </nav>
          <div className="p-4 border-t border-white/10 space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase px-3">Kontrol Sistem</div>
              <button onClick={()=>toggleConfig('enable_major_selection', isMajorSelectionEnabled)} className={`w-full flex justify-between p-3 rounded-lg text-sm font-bold ${isMajorSelectionEnabled?'bg-emerald-500/20 text-emerald-400':'bg-rose-500/20 text-rose-400'}`}>Pilih Jurusan <span>{isMajorSelectionEnabled?'ON':'OFF'}</span></button>
              <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`w-full flex justify-between p-3 rounded-lg text-sm font-bold ${isReleased?'bg-emerald-500/20 text-emerald-400':'bg-rose-500/20 text-rose-400'}`}>Pengumuman <span>{isReleased?'RILIS':'TUTUP'}</span></button>
              <button onClick={onLogout} className="w-full flex items-center gap-2 p-3 mt-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition"><LogOut size={18}/> Keluar</button>
          </div>
      </aside>

      <main className="flex-1 md:ml-72 p-6 md:p-10 overflow-y-auto h-screen">
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
            <span className="font-bold text-slate-800">Menu Admin</span>
            <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu/></button>
        </div>

        {tab === 'periods' && (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div><h2 className="text-3xl font-extrabold text-slate-800">Bank Soal & Ujian</h2><p className="text-slate-500">Kelola paket ujian, subtes, dan soal.</p></div>
                    <button onClick={handleDownloadTemplate} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2"><Download size={18}/> Template Excel</button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900 border-b pb-2">Buat Paket Ujian Baru</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4"><label className="text-xs font-bold text-slate-500 mb-1 block">Nama Paket</label><input className="w-full p-2.5 bg-slate-50 border rounded-lg font-semibold" placeholder="Contoh: Tryout Nasional 1" value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)}/></div>
                        <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 mb-1 block">Tipe</label><select className="w-full p-2.5 bg-slate-50 border rounded-lg" value={examType} onChange={e=>setExamType(e.target.value)}><option value="UTBK">UTBK</option></select></div>
                        <div className="md:col-span-4 flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border w-full justify-center"><input type="checkbox" checked={isRandom} onChange={e=>setIsRandom(e.target.checked)} className="w-4 h-4 accent-indigo-600"/><span className="text-xs font-bold">Acak Soal</span></label>
                            <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2.5 rounded-lg border w-full justify-center"><input type="checkbox" checked={isFlexible} onChange={e=>setIsFlexible(e.target.checked)} className="w-4 h-4 accent-indigo-600"/><span className="text-xs font-bold">Bebas Pilih</span></label>
                        </div>
                        <div className="md:col-span-2"><button onClick={handleCreatePeriod} className="w-full bg-indigo-600 text-white p-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition">Buat Paket</button></div>
                    </div>
                </div>

                <div className="space-y-4">
                    {periods.map(p=>(
                        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                            <div className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-xl text-slate-800">{p.name}</h3>
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded">{p.exam_type}</span>
                                        {p.is_active ? <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded flex items-center gap-1"><Eye size={12}/> Publik</span> : <span className="px-2 py-1 bg-slate-200 text-slate-600 text-xs font-bold rounded flex items-center gap-1"><EyeOff size={12}/> Draft</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                        <span>{p.exams.length} Subtes</span> &bull; <span>{p.is_random?'Acak':'Urut'}</span> &bull; <span>{p.is_flexible?'Bebas':'Sekuensial'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>togglePeriodActive(p.id, p.is_active)} className="p-2 bg-white border rounded hover:bg-slate-50 text-slate-600" title={p.is_active?'Sembunyikan':'Tampilkan'}><Eye size={18}/></button>
                                    <button onClick={()=>togglePeriodSubmit(p.id, p.allow_submit)} className={`p-2 border rounded ${p.allow_submit?'bg-white text-emerald-600':'bg-rose-50 text-rose-600'}`} title="Ijin Submit"><Lock size={18}/></button>
                                    <button onClick={()=>handleDeletePeriod(p.id)} className="p-2 bg-white border border-rose-200 text-rose-600 rounded hover:bg-rose-50"><Trash2 size={18}/></button>
                                    <button onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)} className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100"><ChevronDown className={`transition ${expandedPeriod===p.id?'rotate-180':''}`} size={20}/></button>
                                </div>
                            </div>
                            {expandedPeriod===p.id && (
                                <div className="p-5 border-t border-slate-100 bg-white grid gap-3">
                                    {p.exams.map(e=>(
                                        <div key={e.id} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition group">
                                            <div>
                                                <div className="font-bold text-slate-800">{e.title}</div>
                                                <div className="text-xs text-slate-500 flex items-center gap-2"><Clock size={12}/> {e.duration}m <span className="bg-slate-100 px-1.5 rounded">{e.q_count} Soal</span></div>
                                            </div>
                                            <div className="flex gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={()=>openEditAccess(p)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-200"><Key size={12}/> Akses</button>
                                                <button onClick={()=>openManualInput(e.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm"><PenTool size={12}/> Editor</button>
                                                <button onClick={()=>handlePreviewExam(e.id)} className="bg-white border text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50"><Search size={12}/> Preview</button>
                                                <button onClick={()=>handleShowAnalysis(e.id)} className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1"><PieChart size={12}/> Analisis</button>
                                                <label className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-1"><Upload size={12}/> Excel <input type="file" hidden onChange={ev=>handleUploadQuestion(e.id,ev.target.files[0])}/></label>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* MODAL INPUT SOAL */}
        {showManualInput && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                    <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                        <div><h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><PenTool className="text-indigo-600"/> Editor Soal</h3><p className="text-xs text-slate-500">Edit soal, jawaban, dan pembahasan dalam satu layar.</p></div>
                        <button onClick={()=>setShowManualInput(false)} className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                        <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipe Soal</label><select className="w-full p-3 bg-slate-50 border rounded-lg font-medium" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="multiple_choice">Pilihan Ganda (1 Jawaban)</option><option value="complex">Pilihan Ganda Kompleks</option><option value="table_boolean">Tabel Benar/Salah</option><option value="short_answer">Isian Singkat</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tingkat Kesulitan (1.0 - 2.0)</label><input type="number" step="0.1" className="w-full p-3 bg-slate-50 border rounded-lg font-medium" value={manualQ.difficulty} onChange={e=>setManualQ({...manualQ, difficulty:parseFloat(e.target.value)})}/></div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><BookOpen size={16} className="text-amber-500"/> Wacana / Bacaan (Opsional)</label>
                            <textarea className="w-full h-40 p-4 bg-amber-50/50 border border-amber-100 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-amber-200 outline-none" placeholder="Masukkan teks bacaan di sini..." value={manualQ.reading_material} onChange={e=>setManualQ({...manualQ, reading_material:e.target.value})}/>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><FileText size={16} className="text-indigo-500"/> Pertanyaan</label>
                            <textarea className="w-full h-40 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Tulis pertanyaan... Gunakan $ rumus $ untuk Matematika." value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/>
                            <div className="mt-2 text-xs text-slate-400 bg-slate-50 p-2 rounded border"><strong>Preview:</strong> {renderText(manualQ.text||"...")}</div>
                        </div>
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Grid size={18}/> Jawaban</h4>
                            {manualQ.type === 'table_boolean' ? (
                                <div className="space-y-3">
                                    <div className="flex gap-4 mb-2"><input className="w-1/2 p-2 border rounded text-center font-bold bg-slate-50" placeholder="Label Kiri" value={manualQ.label_true} onChange={e=>setManualQ({...manualQ,label_true:e.target.value})}/><input className="w-1/2 p-2 border rounded text-center font-bold bg-slate-50" placeholder="Label Kanan" value={manualQ.label_false} onChange={e=>setManualQ({...manualQ,label_false:e.target.value})}/></div>
                                    {manualQ.options.map((opt,i)=>(<div key={i} className="flex items-center gap-3"><input className="flex-1 p-3 border rounded-lg" placeholder={`Pernyataan ${i+1}`} value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/><label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-lg border hover:bg-slate-100"><input type="checkbox" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)} className="w-5 h-5 accent-indigo-600"/><span className="text-xs font-bold text-indigo-700">{opt.is_correct?manualQ.label_true:manualQ.label_false}</span></label><button onClick={()=>removeOption(i)} className="text-rose-500 hover:text-rose-700"><Trash2 size={18}/></button></div>))}
                                    <button onClick={()=>setManualQ({...manualQ,options:[...manualQ.options,{label:'',is_correct:false}]})} className="text-xs font-bold text-indigo-600 hover:underline">+ Tambah Baris</button>
                                </div>
                            ) : manualQ.type === 'short_answer' ? (
                                <div><input className="w-full p-3 border-2 border-emerald-100 bg-emerald-50/30 rounded-lg font-bold text-emerald-800" placeholder="Kunci Jawaban Utama" value={manualQ.options[0]?.label||''} onChange={e=>setManualQ({...manualQ,options:[{label:e.target.value,is_correct:true}]})}/></div>
                            ) : (
                                <div className="space-y-3">
                                    {manualQ.options.map((opt,i)=>(<div key={i} className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{String.fromCharCode(65+i)}</div><input className="flex-1 p-3 border rounded-lg transition focus:border-indigo-500" value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/><label className={`flex items-center justify-center w-12 h-12 rounded-lg cursor-pointer border-2 transition ${opt.is_correct?'border-emerald-500 bg-emerald-50 text-emerald-600':'border-slate-200 hover:border-slate-300'}`}><input type="checkbox" className="hidden" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)}/><CheckCircle size={24} className={opt.is_correct?'opacity-100':'opacity-20'}/></label><button onClick={()=>removeOption(i)} className="text-rose-500 hover:text-rose-700"><Trash2 size={18}/></button></div>))}
                                    <button onClick={addOption} className="text-xs font-bold text-indigo-600 hover:underline">+ Tambah Opsi</button>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-emerald-50/50 rounded-xl border border-emerald-100">
                            <label className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3"><BookOpen size={16}/> Pembahasan Lengkap</label>
                            <textarea className="w-full h-32 p-4 bg-white border border-emerald-200 rounded-lg text-sm leading-relaxed outline-none focus:ring-2 focus:ring-emerald-300" placeholder="Jelaskan kenapa jawaban tersebut benar..." value={manualQ.explanation} onChange={e=>setManualQ({...manualQ, explanation:e.target.value})}/>
                        </div>
                    </div>
                    <div className="p-5 border-t bg-white flex justify-end gap-3">
                        <button onClick={()=>setShowManualInput(false)} className="px-6 py-2.5 rounded-lg font-bold text-slate-600 hover:bg-slate-100">Batal</button>
                        <button onClick={saveManualQuestion} className="px-8 py-2.5 rounded-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5">Simpan Soal</button>
                    </div>
                </div>
            </div>
        )}

        {/* MODAL PREVIEW */}
        {showPreview && previewData && (
            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
                    <div className="p-4 border-b flex justify-between items-center bg-slate-50">
                        <h3 className="font-bold text-lg">{previewData.title}</h3>
                        <button onClick={()=>setShowPreview(false)} className="p-2 hover:bg-slate-200 rounded-full"><X/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {previewData.questions.map((q,i)=>(
                            <div key={q.id} className="p-6 border rounded-xl hover:shadow-md transition relative group bg-white">
                                <button onClick={()=>handleDeleteQuestion(q.id)} className="absolute top-4 right-4 text-rose-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={18}/></button>
                                <div className="font-bold text-indigo-900 mb-3">No. {i+1} <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] ml-2 uppercase">{q.type}</span></div>
                                {q.reading_material && <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-300 text-sm mb-4 leading-relaxed italic text-slate-700">{renderText(q.reading_material)}</div>}
                                <div className="text-lg mb-4 text-slate-800">{renderText(q.text)}</div>
                                
                                {q.type === 'table_boolean' ? (
                                    <table className="w-full text-sm border mt-2">
                                        <thead><tr className="bg-slate-50"><th>Pernyataan</th><th>{q.label_true}</th><th>{q.label_false}</th></tr></thead>
                                        <tbody>{q.options.map(o=><tr key={o.id} className="border-t"><td className="p-2">{renderText(o.label)}</td><td className="text-center">{o.is_correct?'✓':''}</td><td className="text-center">{!o.is_correct?'✓':''}</td></tr>)}</tbody>
                                    </table>
                                ) : (
                                    <div className="ml-4 space-y-2">
                                        {q.options.map((o,idx)=>(
                                            <div key={idx} className={`p-2 rounded flex gap-2 ${o.is_correct?'bg-emerald-50 border border-emerald-100 font-semibold text-emerald-800':''}`}>
                                                <span className="w-6 text-center opacity-50">{String.fromCharCode(65+idx)}</span> {renderText(o.label)} {o.is_correct&&<CheckCircle size={16} className="text-emerald-600"/>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {q.explanation && <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-lg text-sm"><strong>Pembahasan:</strong> {renderText(q.explanation)}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
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

        {showAnalysis && analysisData && (
             <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                 <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><div><h3 className="text-xl font-bold">Analisis</h3></div><div className="flex items-center gap-2"><button onClick={handleDownloadAnalysisExcel} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2"><Download size={14}/> Excel</button><button onClick={()=>setShowAnalysis(false)} className="bg-gray-200 p-1.5 rounded hover:bg-gray-300"><X size={18}/></button></div></div>
                 <div className="flex-1 overflow-y-auto p-6"><div className="overflow-x-auto"><table className="w-full text-sm text-left border rounded-lg"><thead className="bg-indigo-50 text-indigo-900 font-bold"><tr><th className="p-3 border-b">No</th><th className="p-3 border-b">Soal</th><th className="p-3 border-b text-center">Diff</th><th className="p-3 border-b text-center">Benar</th><th className="p-3 border-b text-center">%</th></tr></thead><tbody>{analysisData.stats.map((item, idx) => (<tr key={item.id} className="hover:bg-gray-50 border-b"><td className="p-3 text-center">{idx + 1}</td><td className="p-3 text-gray-700 min-w-[200px]">{renderText(item.text)}</td><td className="p-3 text-center text-blue-600">{item.difficulty}</td><td className="p-3 text-center text-green-600">{item.correct}/{item.attempts}</td><td className="p-3 text-center">{item.percentage}%</td></tr>))}</tbody></table></div></div>
             </div></div>
        )}

        {tab === 'majors' && (
            <div><h2 className="text-2xl font-bold mb-6">Manajemen Jurusan</h2>
            <div className="bg-white p-6 rounded shadow mb-6 border-l-4 border-indigo-500"><div className="flex flex-col md:flex-row gap-2 items-end"><div className="flex-1 w-full"><label className="text-xs font-bold text-gray-500">Universitas</label><input className="w-full p-2 border rounded" placeholder="UI" value={newMajor.university} onChange={e=>setNewMajor({...newMajor, university:e.target.value})}/></div><div className="flex-[2] w-full"><label className="text-xs font-bold text-gray-500">Jurusan</label><input className="w-full p-2 border rounded" placeholder="Kedokteran" value={newMajor.name} onChange={e=>setNewMajor({...newMajor, name:e.target.value})}/></div><div className="w-full md:w-32"><label className="text-xs font-bold text-gray-500">PG</label><input type="number" step="0.01" className="w-full p-2 border rounded" placeholder="650" value={newMajor.passing_grade} onChange={e=>setNewMajor({...newMajor, passing_grade:e.target.value})}/></div><button onClick={handleAddMajor} className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded font-bold h-[42px] flex items-center justify-center gap-2"><Plus size={16}/> Simpan</button></div><div className="mt-4 pt-4 border-t"><label className="text-blue-600 cursor-pointer text-sm hover:underline font-bold flex items-center gap-2"><Upload size={16}/> Upload Excel Jurusan<input type="file" hidden accept=".xlsx" onChange={handleBulkUploadMajors}/></label></div></div>
            <div className="bg-white shadow rounded overflow-hidden overflow-x-auto"><div className="max-h-[600px] overflow-y-auto"><table className="w-full text-sm text-left"><thead className="bg-indigo-50 text-indigo-900 sticky top-0"><tr><th className="p-4">Universitas</th><th className="p-4">Jurusan</th><th className="p-4">PG</th><th className="p-4 text-center">Aksi</th></tr></thead><tbody className="divide-y">{majors.map(m=>(<tr key={m.id} className="hover:bg-gray-50"><td className="p-4 font-bold text-gray-700">{m.university}</td><td className="p-4">{m.name}</td><td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{m.passing_grade}</span></td><td className="p-4 text-center"><button onClick={()=>handleDeleteMajor(m.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div></div>
            </div>
        )}

        {tab === 'users' && (<div><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">User Management</h2>{selectedIds.length>0&&<button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"><Trash2 size={16}/> Hapus {selectedIds.length}</button>}</div><div className="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-2"><input className="border p-2 rounded flex-1" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/><input className="border p-2 rounded flex-1" placeholder="Nama" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/><input className="border p-2 rounded flex-1" placeholder="Pass" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/><select className="border p-2 rounded bg-gray-50" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}><option value="student">Siswa</option><option value="admin">Admin</option></select><button onClick={handleAddUser} className="bg-green-600 text-white px-4 py-2 rounded font-bold flex items-center justify-center gap-2"><Plus size={16}/> Tambah</button></div><div className="mb-4"><label className="text-blue-600 cursor-pointer text-sm hover:underline"><Upload size={14} className="inline mr-1"/>Upload Excel User<input type="file" hidden accept=".xlsx" onChange={handleBulkUpload}/></label></div><div className="bg-white shadow rounded overflow-hidden overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="p-3 w-10"><input type="checkbox" onChange={e=>setSelectedIds(e.target.checked?users.map(u=>u.id):[])} checked={users.length>0&&selectedIds.length===users.length}/></th><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Username</th><th className="p-3 text-left">Role</th><th className="p-3 text-center">Aksi</th></tr></thead><tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={()=>{if(selectedIds.includes(u.id))setSelectedIds(selectedIds.filter(i=>i!==u.id));else setSelectedIds([...selectedIds,u.id])}}/></td><td className="p-3">{u.full_name}</td><td className="p-3">{u.username}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{u.role.toUpperCase()}</span></td><td className="p-3 text-center"><button onClick={()=>handleChangePassword(u.id)} className="text-gray-500 hover:text-indigo-600" title="Ganti Password"><Key size={16}/></button></td></tr>))}</tbody></table></div></div>)}
        
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