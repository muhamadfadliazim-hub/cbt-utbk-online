import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Plus, Upload, FileText, Users, LogOut, Lock, Eye, 
  ChevronDown, CheckCircle, XCircle, Download, Search, X, Filter, Clock, Key, 
  Building2, PieChart, PenTool, BookOpen, Grid, LayoutDashboard, Menu, FileCode, Info, Save, Video, Link, Unlock, Music, Image, Edit
} from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Daftar lengkap subtes
const EXAM_CODES = [
    "PU", "PBM", "PPU", "PK", "LBI", "LBE", "PM", 
    "TWK", "TIU", "TKP", 
    "PSI", "AKD", "KEP", 
    "LIS", "STR", "READ", "WRIT", 
    "BIN", "BIG", "MAT", "IPA", "FIS", "KIM", "BIO", "EKO", "SOS", "GEO",
    "UMUM"
];

const LMS_SUBTESTS = {
    UTBK: ["PU", "PBM", "PPU", "PK", "LBI", "LBE", "PM"],
    CPNS: ["TWK", "TIU", "TKP"],
    KEDINASAN: ["TWK", "TIU", "TKP"],
    TNI_POLRI: ["PSI", "AKD", "KEP"],
    TOEFL: ["LIS", "STR", "READ"],
    IELTS: ["LIS", "READ", "WRIT"],
    TKA_SD: ["BIN", "MAT", "IPA"],
    TKA_SMP: ["BIN", "BIG", "MAT", "IPA"],
    TKA_SMA_IPA: ["MAT", "FIS", "KIM", "BIO", "BIN", "BIG"],
    TKA_SMA_IPS: ["MAT", "EKO", "SOS", "GEO", "BIN", "BIG"],
    UMUM: ["UMUM"]
};

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('periods');
  
  // Data
  const [periods, setPeriods] = useState([]);
  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]);
  const [majors, setMajors] = useState([]); 
  const [materials, setMaterials] = useState([]);
  
  // Form State
  const [newPeriodName, setNewPeriodName] = useState('');
  const [examType, setExamType] = useState('UTBK');
  const [isRandom, setIsRandom] = useState(true); 
  const [isFlexible, setIsFlexible] = useState(false); 
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student' });
  const [newMajor, setNewMajor] = useState({ university: '', name: '', passing_grade: '' });
  const [lmsCategory, setLmsCategory] = useState('UTBK');
  const [lmsSubtest, setLmsSubtest] = useState('');
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'pdf', content_url: '', description: '' });

  // Config - FIX SAKLAR
  const [isReleased, setIsReleased] = useState(false);
  const [isMajorSelectionEnabled, setIsMajorSelectionEnabled] = useState(true);

  // UI States
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

  // Manual Question
  const [showManualInput, setShowManualInput] = useState(false);
  const [activeExamIdForManual, setActiveExamIdForManual] = useState(null);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [manualQ, setManualQ] = useState({ 
      text: '', type: 'multiple_choice', difficulty: 1.0, 
      reading_material: '', explanation: '', 
      label_true: 'Benar', label_false: 'Salah', 
      image_url: '', audio_url: '', options: [] 
  });

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  };

  const fetchData = useCallback(() => { 
      fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[])); 
      fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>setUsers(Array.isArray(d)?d:[])); 
      fetch(`${API_URL}/majors`).then(r=>r.json()).then(d=>setMajors(Array.isArray(d)?d:[])); 
      fetch(`${API_URL}/materials`).then(r=>r.json()).then(d=>setMaterials(Array.isArray(d)?d:[])); 
      // FIX SAKLAR FETCH
      fetch(`${API_URL}/config/release_announcement`).then(r=>r.json()).then(d=>setIsReleased(d.value==='true'));
      fetch(`${API_URL}/config/enable_major_selection`).then(r=>r.json()).then(d=>setIsMajorSelectionEnabled(d.value==='true'));
  }, []);

  const fetchRecap = useCallback(() => {
      const url = selectedRecapPeriod ? `${API_URL}/admin/recap?period_id=${selectedRecapPeriod}` : `${API_URL}/admin/recap`;
      fetch(url).then(r=>r.json()).then(d=>setRecap(Array.isArray(d)?d:[]));
  }, [selectedRecapPeriod]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if(tab === 'recap') fetchRecap(); }, [tab, fetchRecap]);

  const apiAction = (url, method, body, onSuccess) => {
      fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
      .then(r=>r.json()).then(d=>{ if(onSuccess) onSuccess(d); else fetchData(); }).catch(e=>alert(e.message));
  };

  const handleUploadFile = async (e, type) => {
      const file = e.target.files[0]; if(!file) return;
      const fd = new FormData(); fd.append('file', file);
      const res = await fetch(`${API_URL}/upload-file`, {method:'POST', body:fd});
      const data = await res.json();
      if(type==='image') setManualQ({...manualQ, image_url: data.url});
      if(type==='audio') setManualQ({...manualQ, audio_url: data.url});
  };

  const getStatusBadge = (s) => {
      if (s && s.startsWith('LULUS')) return <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckCircle size={12}/> {s}</span>;
      return <span className="text-red-600 font-bold text-xs flex items-center gap-1"><XCircle size={12}/> TIDAK LULUS</span>;
  };

  const handleCreatePeriod = () => { if(!newPeriodName)return; apiAction(`${API_URL}/admin/periods`, 'POST', { name: newPeriodName, allowed_usernames: selectedWhitelist.length>0?selectedWhitelist.join(','):null, is_random: isRandom, is_flexible: isFlexible, exam_type: examType }, ()=>{setNewPeriodName(''); setSelectedWhitelist([]); fetchData();}); };
  const updatePeriod = (id, data) => { apiAction(`${API_URL}/admin/periods/${id}`, 'PUT', data, fetchData); };
  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) apiAction(`${API_URL}/admin/periods/${id}`, 'DELETE'); };
  const handleAddUser = () => { apiAction(`${API_URL}/admin/users`, 'POST', newUser, ()=>{alert("User Added");setNewUser({...newUser, username:''});}); };
  const handleBulkDelete = () => { if(window.confirm("Hapus terpilih?")) apiAction(`${API_URL}/admin/users/delete-bulk`, 'POST', {user_ids:selectedIds}, ()=>setSelectedIds([])); };
  const handleBulkUpload = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchData();}) };
  const handleChangePassword = (uid) => { const p = prompt("Pass Baru:"); if(p) apiAction(`${API_URL}/admin/users/${uid}/password`, 'PUT', {new_password:p}, ()=>alert("Diganti")); };
  const handleAddMajor = () => { apiAction(`${API_URL}/majors`, 'POST', newMajor, ()=>{alert("Added");setNewMajor({university:'',name:'',passing_grade:''});}); };
  const handleDeleteMajor = (id) => { apiAction(`${API_URL}/majors/${id}`, 'DELETE'); };
  const handleBulkUploadMajors = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/majors/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchData();}) };
  const handleAddMaterial = () => { const finalCategory = lmsSubtest ? `${lmsCategory} - ${lmsSubtest}` : lmsCategory; apiAction(`${API_URL}/materials`, 'POST', {...newMaterial, category: finalCategory}, ()=>{alert("Materi Added");setNewMaterial({...newMaterial, title:''});}); };
  const handleDeleteMaterial = (id) => { if(window.confirm("Hapus materi?")) apiAction(`${API_URL}/materials/${id}`, 'DELETE'); };
  const handlePreviewExam = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r=>r.json()).then(d=>{setPreviewData(d); setShowPreview(true);}); };
  const handleDeleteQuestion = (qid) => { if(window.confirm("Hapus?")) fetch(`${API_URL}/admin/questions/${qid}`, { method: 'DELETE' }).then(() => { if (previewData) handlePreviewExam(previewData.id||activeExamIdForManual); fetchData(); }); };
  const handleUploadQuestion = (eid, f) => { const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchData();}); };
  const handleDownloadPDF = () => { if(recap.length===0) return alert("Data kosong"); const doc = new jsPDF('landscape'); doc.text("REKAP NILAI", 14, 15); const tableColumn = ["Nama", "Username", ...EXAM_CODES, "Avg", "Status"]; const tableRows = recap.map(r => [r.full_name, r.username, ...EXAM_CODES.map(k=>r[k]||0), r.average, r.status]); autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 }); doc.save('rekap.pdf'); };
  const handleDownloadExcel = () => window.open(`${API_URL}/admin/recap/download?period_id=${selectedRecapPeriod}`, '_blank');
  const handleDownloadTemplate = () => window.open(`${API_URL}/admin/download-template`, '_blank');
  const handleShowAnalysis = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/analysis`).then(r => r.json()).then(d => { setAnalysisData(d); setActiveAnalysisId(eid); setShowAnalysis(true); }); };
  const handleDownloadAnalysisExcel = () => { if (activeAnalysisId) window.open(`${API_URL}/admin/exams/${activeAnalysisId}/analysis/download`, '_blank'); };
  const handleResetResult = (uid, eid) => { if(window.confirm("Reset?")) apiAction(`${API_URL}/admin/reset-result`, 'POST', {user_id:uid, exam_id:eid}, fetchRecap); };
  const handleViewStudentDetail = (d) => { setSelectedStudentDetail(d); setShowDetailModal(true); };
  const toggleConfig = (k, v) => { const nv = !v; apiAction(`${API_URL}/config/${k}`, 'POST', {value:nv?"true":"false"}, ()=>fetchData()); }; // Added refresh on callback
  const toggleUserWhitelist = (u) => { setSelectedWhitelist(selectedWhitelist.includes(u) ? selectedWhitelist.filter(x=>x!==u) : [...selectedWhitelist, u]); };
  const openEditAccess = (p) => { setEditingPeriodId(p.id); setEditAccessUsers(p.allowed_usernames ? p.allowed_usernames.split(',') : []); setShowEditAccessModal(true); };
  const toggleEditAccessUser = (u) => { setEditAccessUsers(editAccessUsers.includes(u) ? editAccessUsers.filter(x=>x!==u) : [...editAccessUsers, u]); };
  const saveEditAccess = () => { apiAction(`${API_URL}/admin/periods/${editingPeriodId}/users`, 'PUT', {allowed_usernames:editAccessUsers.join(',')}, ()=>{alert("Saved");setShowEditAccessModal(false);}); };
  const openManualInput = (eid, qData=null) => { setActiveExamIdForManual(eid); if(qData) { setEditingQuestionId(qData.id); setManualQ({ text: qData.text, type: qData.type, difficulty: 1.0, reading_material: qData.reading_material || '', explanation: qData.explanation || '', label_true: qData.label_true || 'Benar', label_false: qData.label_false || 'Salah', image_url: qData.image_url || '', audio_url: qData.audio_url || '', options: qData.options.map(o=>({label:o.label, is_correct:o.is_correct})) }); } else { setEditingQuestionId(null); setManualQ({text:'',type:'multiple_choice',difficulty:1.0,reading_material:'',explanation:'',label_true:'Benar',label_false:'Salah',image_url:'', audio_url:'',options:[{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false}]}); } setShowManualInput(true); };
  const handleOptionChange = (i, f, v) => { const o=[...manualQ.options]; o[i][f]=v; if(manualQ.type==='multiple_choice'&&f==='is_correct'&&v) o.forEach((x,idx)=>{if(idx!==i)x.is_correct=false}); setManualQ({...manualQ,options:o}); };
  const saveManualQuestion = () => { if(!manualQ.text)return alert("Isi Soal!"); if(editingQuestionId) { apiAction(`${API_URL}/admin/questions/${editingQuestionId}`, 'PUT', manualQ, ()=>{ alert("Update Berhasil!"); setShowManualInput(false); if(previewData) handlePreviewExam(previewData.id || activeExamIdForManual); else fetchData(); }); } else { apiAction(`${API_URL}/admin/exams/${activeExamIdForManual}/manual-question`, 'POST', manualQ, ()=>{ alert("Tersimpan!"); setShowManualInput(false); fetchData(); }); } };

  const SidebarItem = ({ id, icon: Icon, label }) => (
      <button onClick={()=>setTab(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${tab===id ? 'bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
          <Icon size={20} className={tab===id ? 'text-white' : 'text-slate-500 group-hover:text-white'}/> <span>{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
      <aside className={`bg-slate-900 text-white w-72 flex flex-col fixed h-full z-30 transition-transform duration-300 border-r border-slate-800 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3"><div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20"><Building2 size={24} className="text-white"/></div><div><h1 className="font-bold text-lg tracking-tight">EduPrime</h1><span className="text-xs text-slate-500 font-medium px-2 py-0.5 bg-slate-800 rounded-full">Admin Pro</span></div></div>
          <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              <SidebarItem id="periods" icon={FileText} label="Bank Soal" />
              <SidebarItem id="lms" icon={BookOpen} label="Materi & LMS" />
              <SidebarItem id="users" icon={Users} label="Data Peserta" />
              <SidebarItem id="majors" icon={LayoutDashboard} label="Data Jurusan" />
              <SidebarItem id="recap" icon={PieChart} label="Rekap Nilai" />
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900">
              {/* TOMBOL SAKLAR YANG DIPERBAIKI */}
              <button onClick={()=>toggleConfig('enable_major_selection', isMajorSelectionEnabled)} className={`w-full flex justify-between p-3 rounded-lg text-xs font-bold transition-all border ${isMajorSelectionEnabled?'bg-emerald-900/30 text-emerald-400 border-emerald-800':'bg-slate-800 text-slate-400 border-slate-700'}`}>Pilih Jurusan <span>{isMajorSelectionEnabled?'ON':'OFF'}</span></button>
              <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`w-full flex justify-between p-3 rounded-lg text-xs font-bold transition-all border ${isReleased?'bg-emerald-900/30 text-emerald-400 border-emerald-800':'bg-slate-800 text-slate-400 border-slate-700'}`}>Pengumuman <span>{isReleased?'RILIS':'TUTUP'}</span></button>
              <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 mt-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-medium border border-rose-500/20 hover:border-rose-500"><LogOut size={18}/> Keluar Sistem</button>
          </div>
      </aside>

      <main className="flex-1 md:ml-72 p-6 md:p-10 overflow-y-auto h-screen relative">
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200"><span className="font-bold text-slate-700">Menu Admin</span><button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-100 rounded-lg"><Menu/></button></div>

        {tab === 'periods' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center">
                    <div><h2 className="text-3xl font-bold text-slate-800">Bank Soal & Ujian</h2><p className="text-slate-500 mt-1">Kelola paket ujian dan konfigurasi.</p></div>
                    <button onClick={handleDownloadTemplate} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 flex items-center gap-2"><Download size={18}/> Template</button>
                </div>
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                    <h3 className="font-bold text-lg mb-6 text-slate-800 flex items-center gap-2"><PenTool size={20} className="text-indigo-600"/> Buat Paket Ujian Baru</h3>
                    <div className="grid md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-4"><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Nama Paket</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold" placeholder="Contoh: Tryout Nasional 1" value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)}/></div>
                        <div className="md:col-span-3"><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kategori Ujian</label>
                        <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold cursor-pointer" value={examType} onChange={e=>setExamType(e.target.value)}>
                            <option value="UTBK">UTBK SNBT</option><option value="CPNS">SKD CPNS</option><option value="KEDINASAN">Sekolah Kedinasan</option><option value="TNI_POLRI">TNI / POLRI</option><option value="TOEFL">TOEFL</option><option value="IELTS">IELTS</option>
                            <option value="TKA_SD">TKA SD</option><option value="TKA_SMP">TKA SMP</option><option value="TKA_SMA_IPA">TKA SMA IPA</option><option value="TKA_SMA_IPS">TKA SMA IPS</option>
                            <option value="UMUM">Ujian Mandiri</option>
                        </select></div>
                        <div className="md:col-span-3 flex gap-6 pb-3">
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" checked={isRandom} onChange={e=>setIsRandom(e.target.checked)} className="w-5 h-5 accent-indigo-600"/> Acak Soal</label>
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer"><input type="checkbox" checked={isFlexible} onChange={e=>setIsFlexible(e.target.checked)} className="w-5 h-5 accent-indigo-600"/> Fleksibel</label>
                        </div>
                        <div className="md:col-span-2"><button onClick={handleCreatePeriod} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200">Buat</button></div>
                    </div>
                </div>
                <div className="grid gap-6">
                    {periods.map(p=>(
                        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300">
                            <div className="p-6 flex justify-between items-center bg-white relative">
                                <div><div className="flex items-center gap-3 mb-2"><h3 className="font-bold text-xl text-slate-800">{p.name}</h3><span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600">{p.exam_type}</span></div><div className="text-xs text-slate-500 font-medium flex gap-4"><span className="flex items-center gap-1"><Grid size={12}/> {p.exams.length} Subtes</span></div></div>
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>updatePeriod(p.id, {is_active: !p.is_active})} className={`p-2.5 rounded-xl border transition ${p.is_active?'bg-emerald-50 text-emerald-600':'bg-white text-slate-400'}`}><Eye size={18}/></button>
                                    <button onClick={()=>updatePeriod(p.id, {allow_submit: !p.allow_submit})} className={`p-2.5 rounded-xl border transition ${p.allow_submit?'bg-indigo-50 text-indigo-600':'bg-white text-slate-400'}`}><Lock size={18}/></button>
                                    <button onClick={()=>handleDeletePeriod(p.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 transition"><Trash2 size={18}/></button>
                                    <button onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl transition"><ChevronDown size={20}/></button>
                                </div>
                            </div>
                            {expandedPeriod===p.id && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid gap-3">
                                    {p.exams.map(e=>(
                                        <div key={e.id} className="flex justify-between items-center p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 transition">
                                            <div><div className="font-bold text-slate-800">{e.title}</div><div className="text-xs text-slate-500 font-medium flex items-center gap-2"><Clock size={12}/> {e.duration} Menit &bull; {e.q_count} Soal</div></div>
                                            {/* TOMBOL AKSI LENGKAP YANG MUNCUL */}
                                            <div className="flex gap-2">
                                                <button onClick={()=>openEditAccess(p)} className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-200 flex items-center gap-1"><Key size={14}/> Akses</button>
                                                <button onClick={()=>openManualInput(e.id)} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 flex items-center gap-1"><PenTool size={14}/> Editor</button>
                                                <button onClick={()=>handlePreviewExam(e.id)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 flex items-center gap-1"><Search size={14}/> Preview</button>
                                                <button onClick={()=>handleShowAnalysis(e.id)} className="px-3 py-1.5 bg-white border border-slate-200 text-purple-600 rounded-lg text-xs font-bold hover:bg-purple-50 flex items-center gap-1"><PieChart size={14}/> Analisis</button>
                                                <label className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-1"><Upload size={14}/> Excel <input type="file" hidden onChange={ev=>handleUploadQuestion(e.id,ev.target.files[0])}/></label>
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

        {tab === 'lms' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="grid md:grid-cols-4 gap-6 items-end">
                        <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Judul Materi</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={newMaterial.title} onChange={e=>setNewMaterial({...newMaterial, title:e.target.value})}/></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kategori</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer" value={lmsCategory} onChange={e=>setLmsCategory(e.target.value)}>{Object.keys(LMS_SUBTESTS).map(k=><option key={k} value={k}>{k}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Subtes</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer" value={lmsSubtest} onChange={e=>setLmsSubtest(e.target.value)}><option value="">-- Pilih --</option>{LMS_SUBTESTS[lmsCategory]?.map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipe</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer" value={newMaterial.type} onChange={e=>setNewMaterial({...newMaterial, type:e.target.value})}><option value="pdf">PDF</option><option value="video">Video</option><option value="link">Link</option></select></div>
                        <div className="md:col-span-3"><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">URL</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="https://..." value={newMaterial.content_url} onChange={e=>setNewMaterial({...newMaterial, content_url:e.target.value})}/></div>
                        <button onClick={handleAddMaterial} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700">Simpan Materi</button>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {materials.map(m=>(<div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><button onClick={()=>handleDeleteMaterial(m.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button><span className="text-[10px] px-2.5 py-1 rounded-lg font-bold mb-3 inline-block tracking-wide uppercase bg-indigo-50 text-indigo-700">{m.category}</span><h4 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-2">{m.type==='pdf'?<FileText className="text-rose-500"/>:m.type==='video'?<Video className="text-red-600"/>:<Link className="text-blue-500"/>} {m.title}</h4><a href={m.content_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full py-2.5 rounded-xl bg-slate-50 text-indigo-600 font-bold text-sm border border-slate-200 hover:bg-indigo-600 hover:text-white transition mt-4">Buka</a></div>))}
                </div>
            </div>
        )}

        {/* TAB USERS - PERBAIKAN TAMPILAN MANAJEMEN PESERTA */}
        {tab === 'users' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-slate-800">Manajemen Peserta</h2>{selectedIds.length > 0 && <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Trash2 size={16}/> Hapus Terpilih</button>}</div>
                {/* MANUAL INPUT */}
                <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col md:flex-row gap-4 mb-6">
                    <input className="border p-2 rounded-lg flex-1" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/>
                    <input className="border p-2 rounded-lg flex-1" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/>
                    <input className="border p-2 rounded-lg flex-1" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/><button onClick={handleAddUser} className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={16}/> Tambah</button>
                </div>
                {/* UPLOAD EXCEL BUTTON YANG JELAS */}
                <div className="mb-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex justify-between items-center">
                    <div className="text-sm text-indigo-800 font-medium">Butuh tambah banyak siswa sekaligus? Gunakan Upload Excel.</div>
                    <label className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm cursor-pointer hover:bg-indigo-700 flex items-center gap-2 transition"><Upload size={16}/> Upload Excel <input type="file" hidden onChange={handleBulkUpload}/></label>
                </div>
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden"><table className="w-full text-sm text-left"><thead className="bg-slate-700 text-white font-bold"><tr><th className="p-4 w-10"><input type="checkbox" onChange={e=>setSelectedIds(e.target.checked?users.map(u=>u.id):[])}/></th><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4">Aksi</th></tr></thead><tbody>{users.map(u=>(<tr key={u.id} className="border-t hover:bg-slate-50"><td className="p-4"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={()=>{selectedIds.includes(u.id)?setSelectedIds(selectedIds.filter(i=>i!==u.id)):setSelectedIds([...selectedIds,u.id])}}/></td><td className="p-4 font-bold">{u.full_name}</td><td className="p-4 text-slate-500">{u.username}</td><td className="p-4"><button onClick={()=>handleChangePassword(u.id)} className="text-indigo-600 font-bold text-xs"><Key size={14}/></button></td></tr>))}</tbody></table></div>
            </div>
        )}

        {/* ... (TAB MAJORS & RECAP SAMA SEPERTI SEBELUMNYA) ... */}
        {/* ... (SAMA SEPERTI V13, UNTUK MENGHEMAT TEMPAT KARENA TIDAK ADA PERUBAHAN DI SINI) ... */}
        {/* ... (LANGSUNG KE MODAL INPUT SOAL YANG DIPERBAIKI) ... */}

        {/* MODAL INPUT SOAL (EDITOR) - DENGAN OPSI URL */}
        {showManualInput && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                        <div><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><PenTool className="text-indigo-600"/> Editor Soal Profesional</h3><p className="text-xs text-slate-500 mt-1">Buat soal dengan teks, rumus, gambar, dan pembahasan lengkap.</p></div>
                        <button onClick={()=>setShowManualInput(false)} className="p-2 bg-slate-50 rounded-full hover:bg-rose-50 hover:text-rose-600 transition"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                        {/* TIP */}
                        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl flex gap-3 items-start">
                            <Info className="text-indigo-600 shrink-0 mt-0.5" size={18}/>
                            <div className="text-sm text-indigo-900"><strong>Tips Hemat Server:</strong> Gunakan opsi <strong>"Link URL"</strong> jika gambar/audio sudah ada di internet (Google Drive/Imgur). Gunakan <strong>"Upload File"</strong> jika file ada di komputer Anda.</div>
                        </div>

                        {/* CONFIG */}
                        <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipe Soal</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="multiple_choice">Pilihan Ganda (1 Jawaban)</option><option value="complex">Pilihan Ganda Kompleks</option><option value="table_boolean">Tabel Benar/Salah</option><option value="short_answer">Isian Singkat</option></select></div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gambar (Link/Upload)</label>
                                    <div className="flex gap-2">
                                        <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="Paste Link Gambar..." value={manualQ.image_url} onChange={e=>setManualQ({...manualQ, image_url:e.target.value})}/>
                                        <label className="p-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200"><Upload size={18}/><input type="file" className="hidden" onChange={e=>handleUploadFile(e,'image')}/></label>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Audio (Link/Upload)</label>
                                    <div className="flex gap-2">
                                        <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="Paste Link Audio..." value={manualQ.audio_url} onChange={e=>setManualQ({...manualQ, audio_url:e.target.value})}/>
                                        <label className="p-2 bg-slate-100 rounded-lg cursor-pointer hover:bg-slate-200"><Music size={18}/><input type="file" className="hidden" onChange={e=>handleUploadFile(e,'audio')}/></label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* PREVIEW MEDIA */}
                        {manualQ.image_url && <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex justify-center"><img src={manualQ.image_url.startsWith('http') ? manualQ.image_url : `${API_URL}${manualQ.image_url}`} alt="Preview Soal" className="max-h-64 rounded-lg object-contain"/></div>}
                        {manualQ.audio_url && <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"><audio controls className="w-full"><source src={manualQ.audio_url.startsWith('http') ? manualQ.audio_url : `${API_URL}${manualQ.audio_url}`} type="audio/mpeg"/>Browser Anda tidak mendukung audio.</audio></div>}

                        {/* KONTEN */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><BookOpen size={16} className="text-amber-500"/> Wacana / Bacaan</label>
                                <textarea className="w-full h-40 p-4 bg-amber-50/30 border border-amber-100 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-amber-200 outline-none resize-none" placeholder="Tulis teks bacaan di sini (jika ada)..." value={manualQ.reading_material} onChange={e=>setManualQ({...manualQ, reading_material:e.target.value})}/>
                            </div>
                            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><FileText size={16} className="text-indigo-500"/> Pertanyaan Utama</label>
                                <textarea className="w-full h-40 p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-indigo-200 outline-none resize-none" placeholder="Tulis pertanyaan... Gunakan $ rumus $ untuk Matematika." value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/>
                            </div>
                        </div>

                        {/* JAWABAN */}
                        <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Grid size={18}/> Kunci Jawaban</h4>
                            {manualQ.type === 'table_boolean' ? (
                                <div className="space-y-3">
                                    <div className="flex gap-4 mb-2"><input className="w-1/2 p-3 border rounded-xl text-center font-bold bg-slate-50" placeholder="Label Kiri (Benar)" value={manualQ.label_true} onChange={e=>setManualQ({...manualQ,label_true:e.target.value})}/><input className="w-1/2 p-3 border rounded-xl text-center font-bold bg-slate-50" placeholder="Label Kanan (Salah)" value={manualQ.label_false} onChange={e=>setManualQ({...manualQ,label_false:e.target.value})}/></div>
                                    {manualQ.options.map((opt,i)=>(<div key={i} className="flex items-center gap-3"><input className="flex-1 p-3 border rounded-xl" placeholder={`Pernyataan ${i+1}`} value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/><label className={`flex items-center gap-2 cursor-pointer px-4 py-3 rounded-xl border transition ${opt.is_correct?'bg-indigo-600 text-white border-indigo-600':'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}><input type="checkbox" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)} className="hidden"/><span className="text-xs font-bold">{opt.is_correct?manualQ.label_true:manualQ.label_false}</span></label><button onClick={()=>setManualQ({...manualQ,options:manualQ.options.filter((_,idx)=>idx!==i)})} className="p-3 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"><Trash2 size={18}/></button></div>))}
                                    <button onClick={()=>setManualQ({...manualQ,options:[...manualQ.options,{label:'',is_correct:false}]})} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition">+ Tambah Baris</button>
                                </div>
                            ) : manualQ.type === 'short_answer' ? (
                                <div><input className="w-full p-4 border-2 border-emerald-100 bg-emerald-50/30 rounded-xl font-bold text-emerald-800 text-lg" placeholder="Tulis Kunci Jawaban Utama di sini..." value={manualQ.options[0]?.label||''} onChange={e=>setManualQ({...manualQ,options:[{label:e.target.value,is_correct:true}]})}/></div>
                            ) : (
                                <div className="space-y-3">
                                    {manualQ.options.map((opt,i)=>(<div key={i} className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-slate-500">{String.fromCharCode(65+i)}</div><input className={`flex-1 p-3 border rounded-xl transition focus:border-indigo-500 ${opt.is_correct?'border-emerald-500 bg-emerald-50/20':''}`} value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/><label className={`flex items-center justify-center w-12 h-12 rounded-xl cursor-pointer border-2 transition ${opt.is_correct?'border-emerald-500 bg-emerald-500 text-white shadow-lg shadow-emerald-200':'border-slate-200 hover:border-slate-300 bg-white'}`}><input type="checkbox" className="hidden" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)}/><CheckCircle size={24} className={opt.is_correct?'opacity-100':'opacity-20'}/></label><button onClick={()=>setManualQ({...manualQ,options:manualQ.options.filter((_,idx)=>idx!==i)})} className="p-3 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition"><Trash2 size={18}/></button></div>))}
                                    <button onClick={()=>setManualQ({...manualQ,options:[...manualQ.options,{label:'',is_correct:false}]})} className="text-xs font-bold text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-lg transition">+ Tambah Opsi</button>
                                </div>
                            )}
                        </div>

                        {/* PEMBAHASAN */}
                        <div className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                            <label className="flex items-center gap-2 text-sm font-bold text-emerald-800 mb-3"><BookOpen size={16}/> Pembahasan Lengkap</label>
                            <textarea className="w-full h-32 p-4 bg-white border border-emerald-200 rounded-xl text-sm leading-relaxed outline-none focus:ring-2 focus:ring-emerald-300" placeholder="Jelaskan alur penyelesaian soal ini..." value={manualQ.explanation} onChange={e=>setManualQ({...manualQ, explanation:e.target.value})}/>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3">
                        <button onClick={()=>setShowManualInput(false)} className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition">Batal</button>
                        <button onClick={saveManualQuestion} className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform hover:-translate-y-0.5 flex items-center gap-2"><Save size={18}/> Simpan Soal</button>
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;