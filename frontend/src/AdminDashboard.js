import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, Upload, Eye, X, BarChart2, FileSpreadsheet } from 'lucide-react';
import { API_URL } from './config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Render Preview (Sama dengan Student)
const RenderPreview = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span className="text-slate-800">
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
                return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>') }} />;
            })}
        </span>
    );
};

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('exams'); 
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    
    // Forms
    const [newUser, setNewUser] = useState({username:'', full_name:'', password:'', role:'peserta', group:'GENERAL'});
    const [newPeriod, setNewPeriod] = useState({name:'', exam_type:'UTBK', access_code:'', show_result:true, can_finish_early:true});
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', url: '' });
    
    // Manual Question
    const [manualExamId, setManualExamId] = useState(null);
    const [manualQ, setManualQ] = useState({ text: '', type: 'PG', explanation: '', difficulty: 1.0, options: [{idx:'A', label:'', is_correct:false, score_weight:0}, {idx:'B', label:'', is_correct:false, score_weight:0}, {idx:'C', label:'', is_correct:false, score_weight:0}, {idx:'D', label:'', is_correct:false, score_weight:0}, {idx:'E', label:'', is_correct:false, score_weight:0}] });

    // UI Toggles
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [showLmsModal, setShowLmsModal] = useState(false);
    const [previewExamId, setPreviewExamId] = useState(null);
    const [previewQuestions, setPreviewQuestions] = useState([]);

    const refresh = useCallback(() => {
        fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setUsers(d); });
        fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setPeriods(d); });
        fetch(`${API_URL}/materials`).then(r=>r.json()).then(d=>{ if(Array.isArray(d)) setMaterials(d); });
    }, []);
    useEffect(() => { refresh(); }, [refresh]);

    // Handlers
    const showStats = (eid) => { fetch(`${API_URL}/admin/analytics/${eid}`).then(r=>r.json()).then(setAnalytics); };
    const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(()=>{ setShowUserModal(false); refresh(); }); };
    const handleImportUser = (e) => { const f=new FormData(); f.append('file',e.target.files[0]); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:f}).then(refresh); };
    const createPeriod = () => { 
        const f=new FormData();
        f.append('name',newPeriod.name); f.append('exam_type',newPeriod.exam_type); f.append('access_code',newPeriod.access_code); 
        f.append('show_result', newPeriod.show_result); f.append('can_finish_early', newPeriod.can_finish_early);
        fetch(`${API_URL}/admin/periods`,{method:'POST',body:f}).then(()=>{setShowPeriodModal(false);refresh()}); 
    };
    const handleUploadSoal = (eid, file) => { const f = new FormData(); f.append('file', file); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:f}).then(()=>alert("Sukses Upload!")); };
    const handleUploadPassingGrade = (file) => { const f = new FormData(); f.append('file', file); fetch(`${API_URL}/admin/majors/bulk`, {method:'POST', body:f}).then(()=>alert("PG Updated!")); };
    const openPreview = (eid) => { fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d => { setPreviewQuestions(d.questions); setPreviewExamId(eid); }); };
    
    const openManualInput = (eid) => { setManualExamId(eid); setShowManualModal(true); };
    const saveManualQuestion = () => { fetch(`${API_URL}/admin/exams/${manualExamId}/manual`, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(manualQ)}).then(() => { alert("Soal Tersimpan!"); setShowManualModal(false); }); };
    const handleAddLms = (e) => { e.preventDefault(); const f=new FormData();f.append('title',newLms.title);f.append('type',newLms.type);f.append('category',newLms.category);f.append('url',newLms.url); f.append('folder_name', newLms.title); fetch(`${API_URL}/materials`,{method:'POST',body:f}).then(()=>{setShowLmsModal(false);refresh()}); };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <aside className="w-64 bg-white border-r p-6 flex flex-col fixed inset-y-0 z-10 shadow-xl">
                <h2 className="font-black text-2xl mb-8 text-indigo-600">EduPrime</h2>
                <nav className="space-y-3 flex-1">
                    <button onClick={()=>setActiveTab('exams')} className={`w-full text-left p-4 font-bold rounded-2xl flex gap-3 transition-all ${activeTab==='exams'?'bg-indigo-600 text-white shadow-lg shadow-indigo-200':'hover:bg-slate-50 text-slate-500'}`}><Database size={20}/> Bank Soal</button>
                    <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-4 font-bold rounded-2xl flex gap-3 transition-all ${activeTab==='users'?'bg-indigo-600 text-white shadow-lg shadow-indigo-200':'hover:bg-slate-50 text-slate-500'}`}><Users size={20}/> Peserta</button>
                    <button onClick={()=>setActiveTab('lms')} className={`w-full text-left p-4 font-bold rounded-2xl flex gap-3 transition-all ${activeTab==='lms'?'bg-indigo-600 text-white shadow-lg shadow-indigo-200':'hover:bg-slate-50 text-slate-500'}`}><BookOpen size={20}/> Materi LMS</button>
                </nav>
                <button onClick={onLogout} className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-600 hover:text-white transition-all">Keluar Sistem</button>
            </aside>

            <main className="flex-1 p-10 ml-64 overflow-y-auto min-h-screen">
                {/* ANALISIS OVERLAY */}
                {analytics && (
                    <div className="mb-10 p-8 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative animate-in fade-in slide-in-from-top-4">
                        <button onClick={()=>setAnalytics(null)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full"><X size={24}/></button>
                        <h3 className="font-black text-2xl mb-6 flex items-center gap-3"><BarChart2 className="text-indigo-600" size={32}/> Analisis Hasil Ujian</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div>
                                <h4 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">Peringkat Tertinggi</h4>
                                <div className="space-y-3">
                                    {analytics.leaderboard.map((l,i)=>(
                                        <div key={i} className="flex justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="font-bold text-slate-700">#{i+1} {l.name}</span>
                                            <span className="font-black text-indigo-600 text-lg">{l.score}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="h-80 bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                                <h4 className="font-bold text-sm text-slate-400 uppercase tracking-widest mb-4">Statistik Butir Soal (% Benar)</h4>
                                <ResponsiveContainer>
                                    <BarChart data={analytics.stats}>
                                        <XAxis dataKey="no" fontSize={10} tickLine={false} axisLine={false}/>
                                        <YAxis fontSize={10} tickLine={false} axisLine={false}/>
                                        <Tooltip cursor={{fill: '#f1f5f9', radius: 8}} contentStyle={{borderRadius:'16px', border:'none', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.1)'}}/>
                                        <Bar dataKey="pct" fill="#6366f1" radius={[6,6,6,6]} barSize={20}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-black text-slate-800">Bank Soal</h1>
                            <button onClick={()=>setShowPeriodModal(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-all"><Plus size={20}/> Buat Paket Ujian</button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {periods.map(p => (
                                <div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="font-black text-xl text-slate-800 mb-1">{p.name}</h3>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] bg-slate-100 px-3 py-1 rounded-lg font-bold text-slate-500 uppercase tracking-wider">{p.exam_type}</span>
                                                {p.access_code && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-bold uppercase tracking-wider">KODE: {p.access_code}</span>}
                                            </div>
                                        </div>
                                        <button onClick={()=>fetch(`${API_URL}/admin/periods/${p.id}`,{method:'DELETE'}).then(refresh)} className="p-3 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-all"><Trash2 size={20}/></button>
                                    </div>
                                    <div className="space-y-3">
                                        {p.exams.map(e => (
                                            <div key={e.id} className="flex gap-3 items-center p-4 border rounded-2xl bg-slate-50 group-hover:bg-white transition-colors">
                                                <div className="flex-1">
                                                    <p className="font-bold text-sm text-slate-700">{e.title}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase">{e.duration} Menit</p>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button onClick={()=>showStats(e.id)} className="p-2 border rounded-xl hover:bg-indigo-50 text-indigo-600" title="Analisis"><BarChart2 size={16}/></button>
                                                    <button onClick={()=>openPreview(e.id)} className="p-2 border rounded-xl hover:bg-indigo-50 text-indigo-600" title="Preview"><Eye size={16}/></button>
                                                    <label className="p-2 border rounded-xl cursor-pointer hover:bg-indigo-50 text-indigo-600" title="Upload Excel"><Upload size={16}/><input type="file" className="hidden" onChange={x=>handleUploadSoal(e.id, x.target.files[0])}/></label>
                                                    <button onClick={()=>openManualInput(e.id)} className="p-2 border rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs px-3">Edit</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* TAB LAINNYA (USERS, LMS) MENGGUNAKAN POLA YANG SAMA */}
                {activeTab === 'users' && (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-black text-slate-800">Data Peserta</h1>
                            <div className="flex gap-3">
                                <label className="px-6 py-3 bg-white border text-slate-600 rounded-2xl font-bold cursor-pointer hover:bg-slate-50 flex items-center gap-2"><Upload size={18}/> Passing Grade<input type="file" className="hidden" onChange={handleUploadPassingGrade}/></label>
                                <label className="px-6 py-3 bg-emerald-500 text-white rounded-2xl font-bold cursor-pointer hover:bg-emerald-600 flex items-center gap-2 shadow-lg shadow-emerald-100"><FileSpreadsheet size={18}/> Import Excel<input type="file" className="hidden" onChange={handleImportUser}/></label>
                                <button onClick={()=>setShowUserModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200"><Plus size={18}/> Manual</button>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 font-black text-slate-400 uppercase text-xs tracking-wider"><tr><th className="p-6">Nama Lengkap</th><th className="p-6">ID Pengguna</th><th className="p-6">Role</th><th className="p-6">Kode Grup</th></tr></thead>
                                <tbody className="text-slate-700 font-medium">
                                    {users.map(u=>(
                                        <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                            <td className="p-6 font-bold">{u.full_name}</td>
                                            <td className="p-6 font-mono text-xs">{u.username}</td>
                                            <td className="p-6"><span className="bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-bold uppercase">{u.role}</span></td>
                                            <td className="p-6"><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-bold">{u.group_code}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'lms' && (
                    <>
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-4xl font-black text-slate-800">Materi Belajar</h1>
                            <button onClick={()=>setShowLmsModal(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl hover:scale-105 transition-all"><Plus size={20}/> Tambah Materi</button>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {materials.map(m => (
                                <div key={m.id} className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-slate-100 relative group hover:-translate-y-1 transition-all duration-300">
                                    <button onClick={()=>fetch(`${API_URL}/materials/${m.id}`,{method:'DELETE'}).then(refresh)} className="absolute top-6 right-6 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={20}/></button>
                                    <div className="mb-6"><span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg tracking-widest">{m.category}</span></div>
                                    <h4 className="font-bold text-xl text-slate-800 mb-4 leading-tight">{m.title}</h4>
                                    <a href={m.content_url} target="_blank" rel="noreferrer" className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all">BUKA MATERI</a>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* MODAL COMPONENTS (Simple & Functional) */}
            {showUserModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in zoom-in duration-200"><form onSubmit={handleAddUser} className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Tambah Peserta</h3><div className="space-y-3"><input className="w-full p-4 bg-slate-50 border-0 rounded-2xl" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})} required/><input className="w-full p-4 bg-slate-50 border-0 rounded-2xl" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} required/><input className="w-full p-4 bg-slate-50 border-0 rounded-2xl" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} required/><input className="w-full p-4 bg-slate-50 border-0 rounded-2xl" placeholder="Kode Grup (Opsional)" value={newUser.group} onChange={e=>setNewUser({...newUser, group: e.target.value})}/><select className="w-full p-4 bg-slate-50 border-0 rounded-2xl" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}><option value="peserta">Peserta</option><option value="admin">Admin</option></select></div><div className="flex gap-3 mt-6"><button type="button" onClick={()=>setShowUserModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-bold text-slate-500">Batal</button><button type="submit" className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold">Simpan</button></div></form></div>}
            
            {showPeriodModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in zoom-in duration-200"><div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Paket Ujian Baru</h3><div className="space-y-3"><input className="w-full p-4 bg-slate-50 border-0 rounded-2xl" placeholder="Nama Paket" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name:e.target.value})}/><select className="w-full p-4 bg-slate-50 border-0 rounded-2xl" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option><option value="MANDIRI">MANDIRI</option></select><input className="w-full p-4 bg-slate-50 border-0 rounded-2xl" placeholder="Kode Akses (Opsional)" value={newPeriod.access_code} onChange={e=>setNewPeriod({...newPeriod, access_code:e.target.value})}/><div className="flex items-center gap-3 p-2"><input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={newPeriod.show_result} onChange={e=>setNewPeriod({...newPeriod, show_result:e.target.checked})}/><label className="font-bold text-sm text-slate-600">Tampilkan Nilai & Kunci</label></div><div className="flex items-center gap-3 p-2"><input type="checkbox" className="w-5 h-5 accent-indigo-600" checked={newPeriod.can_finish_early} onChange={e=>setNewPeriod({...newPeriod, can_finish_early:e.target.checked})}/><label className="font-bold text-sm text-slate-600">Boleh Selesai Awal</label></div></div><div className="flex gap-3 mt-6"><button onClick={()=>setShowPeriodModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-bold text-slate-500">Batal</button><button onClick={createPeriod} className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold">Buat</button></div></div></div>}
            
            {/* PREVIEW MODAL (Sama dengan Student View) */}
            {previewExamId && (<div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100] backdrop-blur-md animate-in fade-in duration-300"><div className="bg-white w-full max-w-4xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col relative"><div className="bg-indigo-900 p-8 flex justify-between items-center text-white"><h3 className="font-black text-2xl">Preview Soal</h3><button onClick={()=>setPreviewExamId(null)} className="p-3 bg-white/10 rounded-full hover:bg-rose-500 transition-colors"><X size={24}/></button></div><div className="flex-1 overflow-y-auto p-10 space-y-10 bg-slate-50">{previewQuestions.map((q, i) => (<div key={q.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200"><div className="font-black text-indigo-600 mb-4 flex items-center gap-3"><span className="bg-indigo-100 px-3 py-1 rounded-lg text-sm">NO {i+1}</span> <span className="text-slate-400 text-xs font-bold uppercase">{q.type}</span></div>{q.passage && <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 text-lg font-serif leading-relaxed text-justify text-slate-700"><RenderPreview text={q.passage}/></div>}{q.media && <img src={q.media} alt="Soal" className="max-h-64 object-contain mb-6 border rounded-xl mx-auto shadow-sm"/>}<div className="text-xl font-medium mb-6 text-slate-800 leading-relaxed"><RenderPreview text={q.text}/></div><div className="space-y-3">{q.options.map(o => (<div key={o.id} className={`p-4 border-2 rounded-xl flex gap-4 items-center ${o.is_correct?'bg-emerald-50 border-emerald-500 text-emerald-800':'bg-white border-slate-200 text-slate-500'}`}><span className={`font-black w-8 h-8 flex items-center justify-center rounded-full text-sm ${o.is_correct?'bg-emerald-500 text-white':'bg-slate-100 text-slate-400'}`}>{o.id}</span><span className="font-medium text-lg"><RenderPreview text={o.label}/></span>{o.score_weight>0 && <span className="ml-auto text-xs font-black bg-indigo-100 text-indigo-700 px-2 py-1 rounded">BOBOT: {o.score_weight}</span>}</div>))}</div></div>))}</div></div></div>)}
            
            {showManualModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl h-[90vh] overflow-y-auto shadow-2xl"><h3 className="text-xl font-bold mb-6">Input Soal Manual</h3><div className="space-y-4"><select className="w-full p-4 border rounded-2xl bg-slate-50" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="PG">Pilihan Ganda</option><option value="TKP">TKP (CPNS)</option><option value="ISIAN">Isian Singkat</option><option value="BOOLEAN">Benar/Salah</option></select><textarea className="w-full p-4 border rounded-2xl h-32" placeholder="Teks Soal (Support LaTeX $...$ dan HTML)" value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}></textarea><textarea className="w-full p-4 border rounded-2xl h-24" placeholder="Pembahasan" value={manualQ.explanation} onChange={e=>setManualQ({...manualQ, explanation:e.target.value})}></textarea><input className="w-full p-4 border rounded-2xl" placeholder="URL Gambar (Opsional)" value={manualQ.media} onChange={e=>setManualQ({...manualQ, media:e.target.value})}/><div className="space-y-3"><p className="font-bold text-slate-500">Opsi Jawaban & Bobot</p>{manualQ.options.map((opt, idx) => (<div key={idx} className="flex gap-2 items-center"><input type="checkbox" className="w-6 h-6 accent-emerald-500" checked={opt.is_correct} onChange={e=>{const n=[...manualQ.options]; n[idx].is_correct=e.target.checked; setManualQ({...manualQ, options:n})}}/><span className="font-bold w-8">{opt.idx}</span><input className="flex-1 p-3 border rounded-xl" value={opt.label} onChange={e=>{const n=[...manualQ.options]; n[idx].label=e.target.value; setManualQ({...manualQ, options:n})}} placeholder="Teks Opsi"/><input className="w-20 p-3 border rounded-xl text-center" type="number" placeholder="Bobot" value={opt.score_weight} onChange={e=>{const n=[...manualQ.options]; n[idx].score_weight=parseInt(e.target.value); setManualQ({...manualQ, options:n})}}/></div>))}</div></div><div className="flex gap-3 mt-6"><button onClick={()=>setShowManualModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-bold text-slate-500">Batal</button><button onClick={saveManualQuestion} className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold">Simpan</button></div></div></div>)}
            
            {showLmsModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddLms} className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Tambah Materi</h3><div className="space-y-3"><input className="w-full p-4 bg-slate-50 border-0 rounded-2xl" placeholder="Judul Materi" value={newLms.title} onChange={e=>setNewLms({...newLms, title: e.target.value})}/><select className="w-full p-4 bg-slate-50 border-0 rounded-2xl" value={newLms.category} onChange={e=>setNewLms({...newLms, category: e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option><option value="MANDIRI">MANDIRI</option></select><select className="w-full p-4 bg-slate-50 border-0 rounded-2xl" value={newLms.type} onChange={e=>setNewLms({...newLms, type: e.target.value})}><option value="video">Video</option><option value="pdf">PDF</option></select><input className="w-full p-4 bg-slate-50 border-0 rounded-2xl" placeholder="Link URL" value={newLms.url} onChange={e=>setNewLms({...newLms, url: e.target.value})}/></div><div className="flex gap-3 mt-6"><button type="button" onClick={()=>setShowLmsModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-bold text-slate-500">Batal</button><button type="submit" className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold">Simpan</button></div></form></div>}
        </div>
    );
};
export default AdminDashboard;