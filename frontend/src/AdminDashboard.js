import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, FileText, Users, LogOut, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Search, X, Filter, Clock, Key, Building2, PieChart, PenTool, BookOpen, Grid, Settings, LayoutDashboard } from 'lucide-react';
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
  const [examType, setExamType] = useState('UTBK');

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

  const [showManualInput, setShowManualInput] = useState(false);
  const [activeExamIdForManual, setActiveExamIdForManual] = useState(null);
  const [manualQ, setManualQ] = useState({ text: '', type: 'multiple_choice', difficulty: 1.0, reading_material: '', explanation: '', label_true: 'Benar', label_false: 'Salah', options: [] });

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  };

  const fetchData = useCallback(() => {
      fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(setPeriods);
      fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(setUsers);
      fetch(`${API_URL}/majors`).then(r=>r.json()).then(setMajors);
      fetch(`${API_URL}/config/release`).then(r=>r.json()).then(d=>setIsReleased(d.value==='true'));
      fetch(`${API_URL}/config/enable_major_selection`).then(r=>r.json()).then(d=>setIsMajorSelectionEnabled(d.value==='true'));
  }, []);

  const fetchRecap = useCallback(() => {
      const url = selectedRecapPeriod ? `${API_URL}/admin/recap?period_id=${selectedRecapPeriod}` : `${API_URL}/admin/recap`;
      fetch(url).then(r=>r.json()).then(setRecap);
  }, [selectedRecapPeriod]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if(tab==='recap') fetchRecap(); }, [tab, fetchRecap]);

  // Actions Wrapper
  const apiAction = (url, method, body, onSuccess) => {
      fetch(url, { method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(body) })
      .then(r=>r.json()).then(d=>{ if(onSuccess) onSuccess(d); else fetchData(); }).catch(e=>alert(e.message));
  };

  const handleCreatePeriod = () => { if(!newPeriodName)return; apiAction(`${API_URL}/admin/periods`, 'POST', { name: newPeriodName, allowed_usernames: selectedWhitelist.join(',')||null, is_random: isRandom, is_flexible: isFlexible, exam_type: examType }, ()=>{setNewPeriodName('');fetchData();}); };
  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) apiAction(`${API_URL}/admin/periods/${id}`, 'DELETE'); };
  const togglePeriodActive = (id, s) => apiAction(`${API_URL}/admin/periods/${id}/toggle`, 'POST', {is_active:!s});
  const togglePeriodSubmit = (id, s) => apiAction(`${API_URL}/admin/periods/${id}/toggle-submit`, 'POST', {is_active:!s});
  
  // Manual Input Logic
  const openManualInput = (eid) => { setActiveExamIdForManual(eid); setManualQ({text:'',type:'multiple_choice',difficulty:1.0,reading_material:'',explanation:'',label_true:'Benar',label_false:'Salah',options:[{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false},{label:'',is_correct:false}]}); setShowManualInput(true); };
  const handleOptionChange = (i, f, v) => { const o=[...manualQ.options]; o[i][f]=v; if(manualQ.type==='multiple_choice'&&f==='is_correct'&&v) o.forEach((x,idx)=>{if(idx!==i)x.is_correct=false}); setManualQ({...manualQ,options:o}); };
  const saveManualQuestion = () => { if(!manualQ.text)return alert("Isi Soal!"); apiAction(`${API_URL}/admin/exams/${activeExamIdForManual}/manual-question`, 'POST', manualQ, ()=>{alert("Disimpan");setShowManualInput(false);fetchData();}); };
  
  // Utility Components
  const SidebarItem = ({ id, icon: Icon, label }) => (
      <button onClick={()=>setTab(id)} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${tab===id ? 'bg-white/10 text-white font-bold shadow-lg border border-white/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
          <Icon size={20}/> <span>{label}</span>
      </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-800">
      {/* SIDEBAR */}
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
              <button onClick={()=>apiAction(`${API_URL}/config/enable_major_selection`, 'POST', {value:!isMajorSelectionEnabled?"true":"false"})} className={`w-full flex justify-between p-3 rounded-lg text-sm font-bold ${isMajorSelectionEnabled?'bg-emerald-500/20 text-emerald-400':'bg-rose-500/20 text-rose-400'}`}>Pilih Jurusan <span>{isMajorSelectionEnabled?'ON':'OFF'}</span></button>
              <button onClick={()=>apiAction(`${API_URL}/config/release`, 'POST', {value:!isReleased?"true":"false"})} className={`w-full flex justify-between p-3 rounded-lg text-sm font-bold ${isReleased?'bg-emerald-500/20 text-emerald-400':'bg-rose-500/20 text-rose-400'}`}>Pengumuman <span>{isReleased?'RILIS':'TUTUP'}</span></button>
              <button onClick={onLogout} className="w-full flex items-center gap-2 p-3 mt-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-rose-600 hover:text-white transition"><LogOut size={18}/> Keluar</button>
          </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 md:ml-72 p-6 md:p-10 overflow-y-auto h-screen">
        {/* HEADER MOBILE */}
        <div className="md:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
            <span className="font-bold text-slate-800">Menu Admin</span>
            <button onClick={()=>setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu/></button>
        </div>

        {tab === 'periods' && (
            <div className="space-y-8">
                <div className="flex justify-between items-center">
                    <div><h2 className="text-3xl font-extrabold text-slate-800">Bank Soal & Ujian</h2><p className="text-slate-500">Kelola paket ujian, subtes, dan soal.</p></div>
                    <button onClick={()=>window.open(`${API_URL}/admin/download-template`)} className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg font-bold shadow-sm hover:bg-slate-50 flex items-center gap-2"><Download size={18}/> Template Excel</button>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-lg mb-4 text-indigo-900 border-b pb-2">Buat Paket Ujian Baru</h3>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-4"><label className="text-xs font-bold text-slate-500 mb-1 block">Nama Paket</label><input className="w-full p-2.5 bg-slate-50 border rounded-lg font-semibold" placeholder="Contoh: Tryout Nasional 1" value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)}/></div>
                        <div className="md:col-span-2"><label className="text-xs font-bold text-slate-500 mb-1 block">Tipe</label><select className="w-full p-2.5 bg-slate-50 border rounded-lg" value={examType} onChange={e=>setExamType(e.target.value)}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="UMUM">Umum</option></select></div>
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
                                                <button onClick={()=>openManualInput(e.id)} className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-indigo-700 shadow-sm"><PenTool size={12}/> Editor</button>
                                                <button onClick={()=>handlePreviewExam(e.id)} className="bg-white border text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-50">Preview</button>
                                                <label className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 cursor-pointer flex items-center gap-1"><Upload size={12}/> Excel <input type="file" hidden onChange={ev=>apiAction(`${API_URL}/admin/upload-questions/${e.id}`,'POST',new FormData().append('file',ev.target.files[0]))}/></label>
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

        {/* MODAL INPUT SOAL (EDITOR) */}
        {showManualInput && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
                    <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                        <div><h3 className="text-xl font-extrabold text-slate-800 flex items-center gap-2"><PenTool className="text-indigo-600"/> Editor Soal</h3><p className="text-xs text-slate-500">Edit soal, jawaban, dan pembahasan dalam satu layar.</p></div>
                        <button onClick={()=>setShowManualInput(false)} className="p-2 bg-white rounded-full shadow hover:bg-slate-100"><X size={20}/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50">
                        {/* 1. TIPE & KESULITAN */}
                        <div className="grid grid-cols-2 gap-6 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipe Soal</label><select className="w-full p-3 bg-slate-50 border rounded-lg font-medium" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="multiple_choice">Pilihan Ganda (1 Jawaban)</option><option value="complex">Pilihan Ganda Kompleks</option><option value="table_boolean">Tabel Benar/Salah</option><option value="short_answer">Isian Singkat</option></select></div>
                            <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tingkat Kesulitan (1.0 - 2.0)</label><input type="number" step="0.1" className="w-full p-3 bg-slate-50 border rounded-lg font-medium" value={manualQ.difficulty} onChange={e=>setManualQ({...manualQ, difficulty:parseFloat(e.target.value)})}/></div>
                        </div>

                        {/* 2. KONTEN SOAL */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><BookOpen size={16} className="text-amber-500"/> Wacana / Bacaan (Opsional)</label>
                                <textarea className="w-full h-40 p-4 bg-amber-50/50 border border-amber-100 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-amber-200 outline-none" placeholder="Masukkan teks bacaan di sini..." value={manualQ.reading_material} onChange={e=>setManualQ({...manualQ, reading_material:e.target.value})}/>
                            </div>
                            <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3"><FileText size={16} className="text-indigo-500"/> Pertanyaan</label>
                                <textarea className="w-full h-40 p-4 bg-indigo-50/50 border border-indigo-100 rounded-lg text-sm leading-relaxed focus:ring-2 focus:ring-indigo-200 outline-none" placeholder="Tulis pertanyaan... Gunakan $ rumus $ untuk Matematika." value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/>
                                <div className="mt-2 text-xs text-slate-400 bg-slate-50 p-2 rounded border"><strong>Preview:</strong> {renderText(manualQ.text||"...")}</div>
                            </div>
                        </div>

                        {/* 3. JAWABAN */}
                        <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Grid size={18}/> Jawaban</h4>
                            {manualQ.type === 'table_boolean' ? (
                                <div className="space-y-3">
                                    <div className="flex gap-4 mb-2"><input className="w-1/2 p-2 border rounded text-center font-bold bg-slate-50" placeholder="Label Kiri" value={manualQ.label_true} onChange={e=>setManualQ({...manualQ,label_true:e.target.value})}/><input className="w-1/2 p-2 border rounded text-center font-bold bg-slate-50" placeholder="Label Kanan" value={manualQ.label_false} onChange={e=>setManualQ({...manualQ,label_false:e.target.value})}/></div>
                                    {manualQ.options.map((opt,i)=>(<div key={i} className="flex items-center gap-3"><input className="flex-1 p-3 border rounded-lg" placeholder={`Pernyataan ${i+1}`} value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/><label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-lg border hover:bg-slate-100"><input type="checkbox" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)} className="w-5 h-5 accent-indigo-600"/><span className="text-xs font-bold text-indigo-700">{opt.is_correct?manualQ.label_true:manualQ.label_false}</span></label></div>))}
                                    <button onClick={()=>setManualQ({...manualQ,options:[...manualQ.options,{label:'',is_correct:false}]})} className="text-xs font-bold text-indigo-600 hover:underline">+ Tambah Baris</button>
                                </div>
                            ) : manualQ.type === 'short_answer' ? (
                                <div><input className="w-full p-3 border-2 border-emerald-100 bg-emerald-50/30 rounded-lg font-bold text-emerald-800" placeholder="Kunci Jawaban Utama" value={manualQ.options[0]?.label||''} onChange={e=>setManualQ({...manualQ,options:[{label:e.target.value,is_correct:true}]})}/></div>
                            ) : (
                                <div className="space-y-3">
                                    {manualQ.options.map((opt,i)=>(<div key={i} className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">{String.fromCharCode(65+i)}</div><input className="flex-1 p-3 border rounded-lg transition focus:border-indigo-500" value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/><label className={`flex items-center justify-center w-12 h-12 rounded-lg cursor-pointer border-2 transition ${opt.is_correct?'border-emerald-500 bg-emerald-50 text-emerald-600':'border-slate-200 hover:border-slate-300'}`}><input type="checkbox" className="hidden" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)}/><CheckCircle size={24} className={opt.is_correct?'opacity-100':'opacity-20'}/></label></div>))}
                                    <button onClick={()=>setManualQ({...manualQ,options:[...manualQ.options,{label:'',is_correct:false}]})} className="text-xs font-bold text-indigo-600 hover:underline">+ Tambah Opsi</button>
                                </div>
                            )}
                        </div>

                        {/* 4. PEMBAHASAN */}
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
                                <div className="ml-4 space-y-2">
                                    {q.options.map((o,idx)=>(
                                        <div key={idx} className={`p-2 rounded flex gap-2 ${o.is_correct?'bg-emerald-50 border border-emerald-100 font-semibold text-emerald-800':''}`}>
                                            <span className="w-6 text-center opacity-50">{String.fromCharCode(65+idx)}</span> {renderText(o.label)} {o.is_correct&&<CheckCircle size={16} className="text-emerald-600"/>}
                                        </div>
                                    ))}
                                </div>
                                {q.explanation && <div className="mt-4 p-4 bg-blue-50 text-blue-900 rounded-lg text-sm"><strong>Pembahasan:</strong> {renderText(q.explanation)}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;