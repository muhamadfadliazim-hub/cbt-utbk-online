import React, { useState, useEffect, useCallback } from 'react';
import { 
  Trash2, Plus, Upload, FileText, Users, LogOut, Lock, Eye, EyeOff, 
  ChevronDown, CheckCircle, XCircle, Download, Search, X, Filter, Clock, Key, 
  Building2, PieChart, PenTool, BookOpen, Grid, LayoutDashboard, Menu, FileCode, Info, Save, Video, Link, Settings, Unlock, Music, Image
} from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXAM_ORDER = ["PU", "PBM", "PPU", "PK", "LBI", "LBE", "PM", "TWK", "TIU", "TKP", "UMUM", "PSI", "AKD", "KEP", "LIS", "STR", "READ"];

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('periods');
  
  // Data
  const [periods, setPeriods] = useState([]);
  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]);
  const [majors, setMajors] = useState([]); 
  const [materials, setMaterials] = useState([]);
  
  // Forms
  const [newPeriodName, setNewPeriodName] = useState('');
  const [examType, setExamType] = useState('UTBK');
  const [isRandom, setIsRandom] = useState(true); 
  const [isFlexible, setIsFlexible] = useState(false); 
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student' });
  const [newMajor, setNewMajor] = useState({ university: '', name: '', passing_grade: '' });
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'pdf', content_url: '', category: 'UTBK', description: '' });

  // Config
  const [isReleased, setIsReleased] = useState(false);
  const [isMajorSelectionEnabled, setIsMajorSelectionEnabled] = useState(true);

  // UI
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
      fetch(`${API_URL}/config/release`).then(r=>r.json()).then(d=>setIsReleased(d.value==='true'));
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
      const res = await fetch(`${API_URL}/upload-image`, {method:'POST', body:fd});
      const data = await res.json();
      if(type==='image') setManualQ({...manualQ, image_url: data.url});
      if(type==='audio') setManualQ({...manualQ, audio_url: data.url});
  };

  const getStatusBadge = (s) => {
      if (s && s.startsWith('LULUS')) return <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckCircle size={12}/> {s}</span>;
      return <span className="text-red-600 font-bold text-xs flex items-center gap-1"><XCircle size={12}/> TIDAK LULUS</span>;
  };

  const handleCreatePeriod = () => { if(!newPeriodName)return; apiAction(`${API_URL}/admin/periods`, 'POST', { name: newPeriodName, allowed_usernames: selectedWhitelist.length>0?selectedWhitelist.join(','):null, is_random: isRandom, is_flexible: isFlexible, exam_type: examType }, ()=>{setNewPeriodName(''); setSelectedWhitelist([]); fetchData();}); };
  
  // FIX: Fungsi Toggle agar tombol Sembunyikan/Tampilkan berfungsi
  const togglePeriodActive = (id, currentStatus) => {
      // Perlu endpoint di backend untuk toggle. Jika belum ada, gunakan PUT/Update.
      // Asumsi backend support update field 'is_active'.
      // Jika backend Anda belum punya endpoint khusus toggle, kita bisa buat endpoint update generic.
      // SEMENTARA: Gunakan endpoint create/update jika ada, atau buat endpoint khusus di backend.
      // SOLUSI CEPAT: Kirim request update ke endpoint periods/{id} (jika ada PUT) atau buat endpoint toggle.
      // SAYA AKAN GUNAKAN ENDPOINT KHUSUS TOGGLE DI SINI (Pastikan backend support)
      // JIKA BACKEND BELUM ADA ENDPOINT TOGGLE, ANDA HARUS UPDATE BACKEND JUGA. 
      // TAPI UNTUK SEKARANG, KITA PAKAI LOGIKA YANG SUDAH ADA DI KODE SEBELUMNYA:
      // (Lihat kode backend Anda, tidak ada endpoint khusus toggle. Mari kita tambahkan di langkah selanjutnya jika perlu).
      // TAPI TUNGGU, di kode backend Anda yang terakhir tidak ada endpoint PUT /admin/periods/{id}.
      // KITA PERLU MENAMBAHKAN ENDPOINT UPDATE PERIODE DI BACKEND.
      alert("Fitur Toggle belum didukung di backend. Mohon update backend main.py untuk menambahkan endpoint PUT /admin/periods/{id}");
  };

  // KARENA ANDA MINTA PERBAIKAN TOMBOL, SAYA AKAN MENGUBAH FRONTEND INI AGAR MEMANGGIL ENDPOINT YANG BENAR.
  // NAMUN, BACKEND JUGA HARUS DIUPDATE. SAYA AKAN BERIKAN UPDATE BACKEND SETELAH INI.
  
  // FUNGSI UPDATE PERIODE (YANG BENAR)
  const updatePeriod = (id, data) => {
      apiAction(`${API_URL}/admin/periods/${id}`, 'PUT', data, fetchData);
  };

  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) apiAction(`${API_URL}/admin/periods/${id}`, 'DELETE'); };
  
  const handleAddUser = () => { apiAction(`${API_URL}/admin/users`, 'POST', newUser, ()=>{alert("User Added");setNewUser({...newUser, username:''});}); };
  const handleBulkDelete = () => { if(window.confirm("Hapus terpilih?")) apiAction(`${API_URL}/admin/users/delete-bulk`, 'POST', {user_ids:selectedIds}, ()=>setSelectedIds([])); };
  const handleBulkUpload = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchData();}) };
  const handleChangePassword = (uid) => { const p = prompt("Pass Baru:"); if(p) apiAction(`${API_URL}/admin/users/${uid}/password`, 'PUT', {new_password:p}, ()=>alert("Diganti")); };

  const handleAddMajor = () => { apiAction(`${API_URL}/majors`, 'POST', newMajor, ()=>{alert("Added");setNewMajor({university:'',name:'',passing_grade:''});}); };
  const handleDeleteMajor = (id) => { apiAction(`${API_URL}/majors/${id}`, 'DELETE'); };
  const handleBulkUploadMajors = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/majors/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchData();}) };

  const handleAddMaterial = () => { apiAction(`${API_URL}/materials`, 'POST', newMaterial, ()=>{alert("Materi Added");setNewMaterial({...newMaterial, title:''});}); };
  const handleDeleteMaterial = (id) => { if(window.confirm("Hapus materi?")) apiAction(`${API_URL}/materials/${id}`, 'DELETE'); };

  const handlePreviewExam = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r=>r.json()).then(d=>{setPreviewData(d); setShowPreview(true);}); };
  const handleDeleteQuestion = (qid) => { if(window.confirm("Hapus?")) fetch(`${API_URL}/admin/questions/${qid}`, { method: 'DELETE' }).then(() => { if (previewData) handlePreviewExam(previewData.id||activeExamIdForManual); fetchData(); }); };
  const handleUploadQuestion = (eid, f) => { const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchData();}); };

  const handleDownloadPDF = () => {
    if(recap.length===0) return alert("Data kosong");
    const doc = new jsPDF('landscape'); doc.text("REKAP NILAI", 14, 15);
    const tableColumn = ["Nama", "Username", ...EXAM_ORDER, "Avg", "Status"];
    const tableRows = recap.map(r => [r.full_name, r.username, ...EXAM_ORDER.map(k=>r[k]||0), r.average, r.status]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('rekap.pdf');
  };
  const handleDownloadExcel = () => window.open(`${API_URL}/admin/recap/download?period_id=${selectedRecapPeriod}`, '_blank');
  const handleDownloadTemplate = () => window.open(`${API_URL}/admin/download-template`, '_blank');
  const handleShowAnalysis = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/analysis`).then(r => r.json()).then(d => { setAnalysisData(d); setActiveAnalysisId(eid); setShowAnalysis(true); }); };
  const handleDownloadAnalysisExcel = () => { if (activeAnalysisId) window.open(`${API_URL}/admin/exams/${activeAnalysisId}/analysis/download`, '_blank'); };
  const handleResetResult = (uid, eid) => { if(window.confirm("Reset?")) apiAction(`${API_URL}/admin/reset-result`, 'POST', {user_id:uid, exam_id:eid}, fetchRecap); };
  const handleViewStudentDetail = (d) => { setSelectedStudentDetail(d); setShowDetailModal(true); };

  const toggleConfig = (k, v) => { const nv = !v; if(k==='release_announcement') setIsReleased(nv); if(k==='enable_major_selection') setIsMajorSelectionEnabled(nv); apiAction(`${API_URL}/config/${k}`, 'POST', {value:nv?"true":"false"}); };
  const toggleUserWhitelist = (u) => { setSelectedWhitelist(selectedWhitelist.includes(u) ? selectedWhitelist.filter(x=>x!==u) : [...selectedWhitelist, u]); };
  const openEditAccess = (p) => { setEditingPeriodId(p.id); setEditAccessUsers(p.allowed_usernames ? p.allowed_usernames.split(',') : []); setShowEditAccessModal(true); };
  const toggleEditAccessUser = (u) => { setEditAccessUsers(editAccessUsers.includes(u) ? editAccessUsers.filter(x=>x!==u) : [...editAccessUsers, u]); };
  const saveEditAccess = () => { apiAction(`${API_URL}/admin/periods/${editingPeriodId}/users`, 'PUT', {allowed_usernames:editAccessUsers.join(',')}, ()=>{alert("Saved");setShowEditAccessModal(false);}); };

  const openManualInput = (eid) => { setActiveExamIdForManual(eid); setManualQ({text:'',type:'multiple_choice',difficulty:1.0,reading_material:'',explanation:'',label_true:'Benar',label_false:'Salah',image_url:'', audio_url:'',options:[{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false}]}); setShowManualInput(true); };
  const handleOptionChange = (i, f, v) => { const o=[...manualQ.options]; o[i][f]=v; if(manualQ.type==='multiple_choice'&&f==='is_correct'&&v) o.forEach((x,idx)=>{if(idx!==i)x.is_correct=false}); setManualQ({...manualQ,options:o}); };
  const saveManualQuestion = () => { if(!manualQ.text)return alert("Isi Soal!"); apiAction(`${API_URL}/admin/exams/${activeExamIdForManual}/manual-question`, 'POST', manualQ, ()=>{alert("Tersimpan!"); setShowManualInput(false); fetchData();}); };

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
              <div className="px-4 pb-2 pt-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Main Menu</div>
              <SidebarItem id="periods" icon={FileText} label="Bank Soal" />
              <SidebarItem id="lms" icon={BookOpen} label="Materi & LMS" />
              <SidebarItem id="users" icon={Users} label="Data Peserta" />
              <SidebarItem id="majors" icon={LayoutDashboard} label="Data Jurusan" />
              <SidebarItem id="recap" icon={PieChart} label="Rekap Nilai" />
          </nav>
          <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-900">
              <div className="px-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Control</div>
              <button onClick={()=>toggleConfig('enable_major_selection', isMajorSelectionEnabled)} className={`w-full flex justify-between p-3 rounded-lg text-xs font-bold transition-all ${isMajorSelectionEnabled?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':'bg-slate-800 text-slate-400 border border-slate-700'}`}>Pilih Jurusan <span>{isMajorSelectionEnabled?'ON':'OFF'}</span></button>
              <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`w-full flex justify-between p-3 rounded-lg text-xs font-bold transition-all ${isReleased?'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20':'bg-slate-800 text-slate-400 border border-slate-700'}`}>Pengumuman <span>{isReleased?'RILIS':'TUTUP'}</span></button>
              <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 mt-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all font-medium border border-rose-500/20 hover:border-rose-500"><LogOut size={18}/> Keluar Sistem</button>
          </div>
      </aside>

      <main className="flex-1 md:ml-72 p-6 md:p-10 overflow-y-auto h-screen relative">
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200"><span className="font-bold text-slate-700">Menu Admin</span><button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-100 rounded-lg"><Menu/></button></div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FileText size={24}/></div>
                <div><div className="text-2xl font-bold text-slate-800">{periods.length}</div><div className="text-xs text-slate-500 font-medium">Paket Ujian</div></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Users size={24}/></div>
                <div><div className="text-2xl font-bold text-slate-800">{users.length}</div><div className="text-xs text-slate-500 font-medium">Total Peserta</div></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><BookOpen size={24}/></div>
                <div><div className="text-2xl font-bold text-slate-800">{materials.length}</div><div className="text-xs text-slate-500 font-medium">Materi LMS</div></div>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl"><PieChart size={24}/></div>
                <div><div className="text-2xl font-bold text-slate-800">{recap.length}</div><div className="text-xs text-slate-500 font-medium">Data Nilai</div></div>
            </div>
        </div>

        {tab === 'periods' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div><h2 className="text-3xl font-bold text-slate-800 tracking-tight">Bank Soal & Ujian</h2><p className="text-slate-500 mt-1">Kelola paket ujian, konfigurasi waktu, dan input soal.</p></div>
                    <button onClick={handleDownloadTemplate} className="bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition flex items-center gap-2"><Download size={18}/> Template Excel</button>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-emerald-500"></div>
                    <h3 className="font-bold text-lg mb-6 text-slate-800 flex items-center gap-2"><PenTool size={20} className="text-indigo-600"/> Buat Paket Ujian Baru</h3>
                    <div className="grid md:grid-cols-12 gap-6 items-end">
                        <div className="md:col-span-4"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Nama Paket</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition" placeholder="Contoh: Tryout Nasional 1" value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)}/></div>
                        <div className="md:col-span-3"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Kategori Ujian</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition cursor-pointer" value={examType} onChange={e=>setExamType(e.target.value)}><option value="UTBK">UTBK SNBT</option><option value="CPNS">SKD CPNS</option><option value="KEDINASAN">Sekolah Kedinasan</option><option value="TNI_POLRI">TNI / POLRI</option><option value="TOEFL">TOEFL</option><option value="IELTS">IELTS</option><option value="UMUM">Ujian Mandiri</option></select></div>
                        <div className="md:col-span-3 flex gap-6 pb-3">
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer"><div className={`w-5 h-5 rounded border flex items-center justify-center transition ${isRandom?'bg-indigo-600 border-indigo-600':'bg-white border-slate-300'}`}><CheckCircle size={14} className="text-white"/></div><input type="checkbox" checked={isRandom} onChange={e=>setIsRandom(e.target.checked)} className="hidden"/> Acak Soal</label>
                            <label className="flex items-center gap-3 text-sm font-bold text-slate-700 cursor-pointer"><div className={`w-5 h-5 rounded border flex items-center justify-center transition ${isFlexible?'bg-indigo-600 border-indigo-600':'bg-white border-slate-300'}`}><CheckCircle size={14} className="text-white"/></div><input type="checkbox" checked={isFlexible} onChange={e=>setIsFlexible(e.target.checked)} className="hidden"/> Fleksibel</label>
                        </div>
                        <div className="md:col-span-2"><button onClick={handleCreatePeriod} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform active:scale-95">Buat Sekarang</button></div>
                    </div>
                </div>

                <div className="grid gap-6">
                    {periods.map(p=>(
                        <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
                            <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white relative">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="font-bold text-xl text-slate-800">{p.name}</h3>
                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase ${p.exam_type==='CPNS'?'bg-amber-100 text-amber-700':p.exam_type==='UTBK'?'bg-indigo-100 text-indigo-700':'bg-emerald-100 text-emerald-700'}`}>{p.exam_type}</span>
                                        {p.is_active ? <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold px-2 py-1 bg-emerald-50 rounded-lg"><Eye size={12}/> Publik</span> : <span className="flex items-center gap-1 text-slate-400 text-xs font-bold px-2 py-1 bg-slate-100 rounded-lg"><EyeOff size={12}/> Draft</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium flex gap-4">
                                        <span className="flex items-center gap-1"><Grid size={12}/> {p.exams.length} Subtes</span>
                                        <span className="flex items-center gap-1"><Settings size={12}/> {p.is_random?'Acak':'Urut'} • {p.is_flexible?'Bebas':'Sekuensial'}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={()=>updatePeriod(p.id, {is_active: !p.is_active})} className={`p-2.5 rounded-xl border transition ${p.is_active?'bg-emerald-50 border-emerald-200 text-emerald-600':'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`} title="Toggle Visibility"><Eye size={18}/></button>
                                    <button onClick={()=>updatePeriod(p.id, {allow_submit: !p.allow_submit})} className={`p-2.5 rounded-xl border transition ${p.allow_submit?'bg-indigo-50 border-indigo-200 text-indigo-600':'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`} title="Toggle Submit"><Lock size={18}/></button>
                                    <button onClick={()=>handleDeletePeriod(p.id)} className="p-2.5 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition"><Trash2 size={18}/></button>
                                    <button onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)} className={`p-2.5 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition ${expandedPeriod===p.id?'bg-slate-200':''}`}><ChevronDown size={20} className={`transition-transform duration-300 ${expandedPeriod===p.id?'rotate-180':''}`}/></button>
                                </div>
                            </div>
                            {expandedPeriod===p.id && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50/50 grid gap-3 animate-in slide-in-from-top-2">
                                    {p.exams.map(e=>(
                                        <div key={e.id} className="flex flex-col md:flex-row justify-between items-center p-4 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-sm transition gap-4">
                                            <div className="flex items-center gap-4 w-full md:w-auto">
                                                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm border border-indigo-100">{e.code}</div>
                                                <div><div className="font-bold text-slate-800">{e.title}</div><div className="text-xs text-slate-500 font-medium flex items-center gap-2"><Clock size={12}/> {e.duration} Menit <span className="w-1 h-1 rounded-full bg-slate-300"></span> {e.q_count} Soal</div></div>
                                            </div>
                                            <div className="flex gap-2 w-full md:w-auto">
                                                <button onClick={()=>openEditAccess(p)} className="flex-1 md:flex-none justify-center px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-200 transition"><Key size={14}/> Akses</button>
                                                <button onClick={()=>openManualInput(e.id)} className="flex-1 md:flex-none justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-sm transition"><PenTool size={14}/> Editor</button>
                                                <button onClick={()=>handlePreviewExam(e.id)} className="flex-1 md:flex-none justify-center bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50 transition flex items-center gap-2"><Search size={14}/> Preview</button>
                                                <button onClick={()=>handleShowAnalysis(e.id)} className="flex-1 md:flex-none justify-center bg-white border border-slate-200 text-purple-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-purple-50 hover:border-purple-200 transition flex items-center gap-2"><PieChart size={14}/> Analisis</button>
                                                <label className="flex-1 md:flex-none justify-center bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-2 shadow-sm transition"><Upload size={14}/> Excel <input type="file" hidden onChange={ev=>handleUploadQuestion(e.id,ev.target.files[0])}/></label>
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

        {/* ... (BAGIAN TAB LAIN SAMA SEPERTI SEBELUMNYA) ... */}
        {tab === 'lms' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                {/* ... (KODE LMS TIDAK BERUBAH) ... */}
                <div className="flex justify-between items-center">
                    <div><h2 className="text-3xl font-bold text-slate-800">Learning Management System</h2><p className="text-slate-500 mt-1">Upload materi belajar pendukung (PDF, Video, Link).</p></div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500"></div>
                    <div className="grid md:grid-cols-4 gap-6 items-end">
                        <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Judul Materi</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" value={newMaterial.title} onChange={e=>setNewMaterial({...newMaterial, title:e.target.value})}/></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Kategori</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer" value={newMaterial.category} onChange={e=>setNewMaterial({...newMaterial, category:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="MANDIRI">Mandiri</option></select></div>
                        <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Tipe File</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer" value={newMaterial.type} onChange={e=>setNewMaterial({...newMaterial, type:e.target.value})}><option value="pdf">Dokumen PDF</option><option value="video">Video Youtube</option><option value="link">Tautan Eksternal</option></select></div>
                        <div className="md:col-span-3"><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Link / URL</label><input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl" placeholder="https://..." value={newMaterial.content_url} onChange={e=>setNewMaterial({...newMaterial, content_url:e.target.value})}/></div>
                        <button onClick={handleAddMaterial} className="w-full bg-indigo-600 text-white p-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2"><Plus size={18}/> Tambah Materi</button>
                    </div>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {materials.map(m=>(
                        <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition relative group">
                            <button onClick={()=>handleDeleteMaterial(m.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500 transition"><Trash2 size={18}/></button>
                            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold mb-3 inline-block tracking-wide uppercase ${m.category==='CPNS'?'bg-amber-100 text-amber-700':m.category==='UTBK'?'bg-indigo-100 text-indigo-700':'bg-emerald-100 text-emerald-700'}`}>{m.category}</span>
                            <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2 mb-2">{m.type==='pdf'?<FileText className="text-rose-500" size={20}/>:m.type==='video'?<Video className="text-red-600" size={20}/>:<Link className="text-blue-500" size={20}/>} {m.title}</h4>
                            <p className="text-xs text-slate-400 mb-4 line-clamp-2">{m.content_url}</p>
                            <a href={m.content_url} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full py-2.5 rounded-xl bg-slate-50 text-indigo-600 font-bold text-sm border border-slate-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition">Akses Materi</a>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* ... (TAB LAIN: MAJORS, USERS, RECAP, DLL - KODE SAMA SEPERTI SEBELUMNYA) ... */}
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
                                {q.image_url && <img src={`${API_URL}${q.image_url}`} alt="Soal" className="max-h-40 rounded border shadow-sm mb-4"/>}
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

        {/* MODAL INPUT SOAL (EDITOR) */}
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
                            <div className="text-sm text-indigo-900"><strong>Tips Matematika:</strong> Jika kesulitan menulis rumus LaTeX, tulis rumus di Ms. Word/Kertas, lalu Screenshot/Foto dan gunakan fitur <strong>Upload Gambar</strong> di bawah ini.</div>
                        </div>

                        {/* CONFIG */}
                        <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipe Soal</label><select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="multiple_choice">Pilihan Ganda (1 Jawaban)</option><option value="complex">Pilihan Ganda Kompleks</option><option value="table_boolean">Tabel Benar/Salah</option><option value="short_answer">Isian Singkat</option></select></div>
                            <div className="flex gap-2">
                                <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Gambar</label><label className="flex items-center justify-center w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100"><Image size={18} className="mr-2"/><span className="text-sm">Upload</span><input type="file" className="hidden" onChange={e=>handleUploadFile(e,'image')}/></label></div>
                                <div className="flex-1"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Audio (Listening)</label><label className="flex items-center justify-center w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100"><Music size={18} className="mr-2"/><span className="text-sm">Upload</span><input type="file" className="hidden" onChange={e=>handleUploadFile(e,'audio')}/></label></div>
                            </div>
                        </div>

                        {/* PREVIEW MEDIA */}
                        {manualQ.image_url && <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex justify-center"><img src={`${API_URL}${manualQ.image_url}`} alt="Preview Soal" className="max-h-64 rounded-lg object-contain"/></div>}
                        {manualQ.audio_url && <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm"><audio controls className="w-full"><source src={`${API_URL}${manualQ.audio_url}`} type="audio/mpeg"/>Browser Anda tidak mendukung audio.</audio></div>}

                        {/* KONTEN */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><BookOpen size={16} className="text-amber-500"/> Wacana / Bacaan</label>
                                <textarea className="w-full h-40 p-4 bg-amber-50/30 border border-amber-100 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-amber-200 outline-none resize-none" placeholder="Tulis teks bacaan di sini (jika ada)..." value={manualQ.reading_material} onChange={e=>setManualQ({...manualQ, reading_material:e.target.value})}/>
                            </div>
                            <div className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><FileText size={16} className="text-indigo-500"/> Pertanyaan Utama</label>
                                <textarea className="w-full h-40 p-4 bg-indigo-50/30 border border-indigo-100 rounded-xl text-sm leading-relaxed focus:ring-2 focus:ring-indigo-200 outline-none resize-none" placeholder="Tulis pertanyaan... Gunakan $ rumus $ untuk Matematika." value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/>
                                <div className="mt-3 text-xs text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100"><strong>Preview:</strong> {renderText(manualQ.text||"...")}</div>
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