import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, Upload, Eye, X, BarChart2, FileSpreadsheet } from 'lucide-react';
import { API_URL } from './config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'katex/dist/katex.min.css'; // Wajib
import { InlineMath } from 'react-katex'; // FIXED: Import ditambahkan

// Helper Render Soal
const RenderPreview = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
                return <span key={index}>{part}</span>;
            })}
        </span>
    );
};

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('exams'); 
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [materials, setMaterials] = useState([]); // State materials
    
    // State Form
    const [newUser, setNewUser] = useState({username:'', full_name:'', password:'', role:'peserta', group:'GENERAL'});
    const [newPeriod, setNewPeriod] = useState({name:'', exam_type:'UTBK', access_code:'', show_result:true, can_finish_early:true});
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', url: '' }); // State LMS
    
    // Modal States
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [showLmsModal, setShowLmsModal] = useState(false); // Modal LMS
    
    const [previewExamId, setPreviewExamId] = useState(null);
    const [previewQuestions, setPreviewQuestions] = useState([]);
    
    const [manualExamId, setManualExamId] = useState(null);
    const [manualQ, setManualQ] = useState({ text: '', type: 'PG', explanation: '', difficulty: 1.0, options: [{idx:'A', label:'', is_correct:false, score_weight:0}, {idx:'B', label:'', is_correct:false, score_weight:0}, {idx:'C', label:'', is_correct:false, score_weight:0}, {idx:'D', label:'', is_correct:false, score_weight:0}, {idx:'E', label:'', is_correct:false, score_weight:0}] });

    const refresh = useCallback(() => {
        fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(setUsers);
        fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(setPeriods);
        fetch(`${API_URL}/materials`).then(r=>r.json()).then(setMaterials);
    }, []);
    useEffect(() => { refresh(); }, [refresh]);

    const showStats = (eid) => { fetch(`${API_URL}/admin/analytics/${eid}`).then(r=>r.json()).then(setAnalytics); };
    
    const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(()=>{ setShowUserModal(false); refresh(); }); };
    const handleImportUser = (e) => { const f=new FormData(); f.append('file',e.target.files[0]); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:f}).then(refresh); };
    
    const createPeriod = () => { 
        const f=new FormData();
        f.append('name',newPeriod.name); f.append('exam_type',newPeriod.exam_type); f.append('access_code',newPeriod.access_code);
        f.append('show_result', newPeriod.show_result); f.append('can_finish_early', newPeriod.can_finish_early);
        fetch(`${API_URL}/admin/periods`,{method:'POST',body:f}).then(()=>{setShowPeriodModal(false);refresh()}); 
    };
    
    const handleUploadSoal = (eid, file) => { const f = new FormData(); f.append('file', file); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:f}).then(()=>alert("Sukses!")); };
    const handleUploadPassingGrade = (file) => { const f = new FormData(); f.append('file', file); fetch(`${API_URL}/admin/majors/bulk`, {method:'POST', body:f}).then(()=>alert("Passing Grade Updated!")); };
    const openPreview = (eid) => { fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d => { setPreviewQuestions(d.questions); setPreviewExamId(eid); }); };
    
    const openManualInput = (eid) => { setManualExamId(eid); setShowManualModal(true); };
    const saveManualQuestion = () => { fetch(`${API_URL}/admin/exams/${manualExamId}/manual`, {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(manualQ)}).then(() => { alert("Soal Tersimpan!"); setShowManualModal(false); }); };
    
    const handleAddLms = (e) => { e.preventDefault(); const f=new FormData();f.append('title',newLms.title);f.append('type',newLms.type);f.append('category',newLms.category);f.append('url',newLms.url); f.append('folder_name', newLms.title); fetch(`${API_URL}/materials`,{method:'POST',body:f}).then(()=>{setShowLmsModal(false);refresh()}); };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <aside className="w-64 bg-white border-r p-6 flex flex-col fixed inset-y-0 z-10">
                <h2 className="font-black text-2xl mb-8 text-indigo-600">EduPrime</h2>
                <nav className="space-y-2 flex-1">
                    <button onClick={()=>setActiveTab('exams')} className={`w-full text-left p-3 font-bold rounded-xl flex gap-3 ${activeTab==='exams'?'bg-indigo-50 text-indigo-600':'hover:bg-slate-50'}`}><Database size={20}/> Bank Soal</button>
                    <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-3 font-bold rounded-xl flex gap-3 ${activeTab==='users'?'bg-indigo-50 text-indigo-600':'hover:bg-slate-50'}`}><Users size={20}/> Peserta</button>
                    <button onClick={()=>setActiveTab('lms')} className={`w-full text-left p-3 font-bold rounded-xl flex gap-3 ${activeTab==='lms'?'bg-indigo-50 text-indigo-600':'hover:bg-slate-50'}`}><BookOpen size={20}/> Materi LMS</button>
                </nav>
                <button onClick={onLogout} className="p-3 bg-rose-50 text-rose-600 rounded-xl font-bold">Logout</button>
            </aside>

            <main className="flex-1 p-8 ml-64 overflow-y-auto min-h-screen">
                {analytics && (
                    <div className="mb-8 p-6 bg-white rounded-[2rem] shadow-xl border border-slate-100 relative animate-in fade-in slide-in-from-top-4">
                        <button onClick={()=>setAnalytics(null)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                        <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><BarChart2 className="text-indigo-600"/> Analisis Hasil</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-sm text-slate-500 mb-3">Top 10 Peringkat</h4>
                                <div className="space-y-2">
                                    {analytics.leaderboard.map((l,i)=>(<div key={i} className="flex justify-between p-3 bg-slate-50 rounded-xl"><span className="font-bold">#{i+1} {l.name}</span><span className="font-mono text-indigo-600">{l.score}</span></div>))}
                                </div>
                            </div>
                            <div className="h-64">
                                <h4 className="font-bold text-sm text-slate-500 mb-3">Statistik Soal (% Benar)</h4>
                                <ResponsiveContainer>
                                    <BarChart data={analytics.stats}>
                                        <XAxis dataKey="no" fontSize={10}/>
                                        <YAxis fontSize={10}/>
                                        <Tooltip/>
                                        <Bar dataKey="pct" fill="#6366f1" radius={[4,4,0,0]}/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <>
                        <div className="flex justify-between mb-6">
                            <h1 className="text-3xl font-black">Bank Soal</h1>
                            <button onClick={()=>setShowPeriodModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"><Plus size={18}/> Buat Paket</button>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {periods.map(p => (
                                <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <div><h3 className="font-bold text-lg">{p.name}</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">{p.exam_type} {p.access_code?`[${p.access_code}]`:''} {p.show_result?'':'(Hidden)'}</span></div>
                                        <button onClick={()=>fetch(`${API_URL}/admin/periods/${p.id}`,{method:'DELETE'}).then(refresh)} className="p-2 hover:bg-rose-50 text-rose-400 rounded-lg"><Trash2 size={18}/></button>
                                    </div>
                                    <div className="space-y-2">
                                        {p.exams.map(e => (
                                            <div key={e.id} className="flex gap-2 items-center p-3 border rounded-xl bg-slate-50">
                                                <span className="font-bold text-xs flex-1">{e.title} ({e.duration}m)</span>
                                                <button onClick={()=>showStats(e.id)} className="p-2 bg-white border rounded-lg hover:border-indigo-500 text-indigo-600" title="Analisis"><BarChart2 size={16}/></button>
                                                <button onClick={()=>openPreview(e.id)} className="p-2 bg-white border rounded-lg hover:border-indigo-500 text-indigo-600" title="Preview"><Eye size={16}/></button>
                                                <label className="p-2 bg-white border rounded-lg cursor-pointer hover:border-indigo-500 text-indigo-600" title="Upload Soal"><Upload size={16}/><input type="file" className="hidden" onChange={x=>handleUploadSoal(e.id, x.target.files[0])}/></label>
                                                <button onClick={()=>openManualInput(e.id)} className="p-2 bg-white border rounded-lg text-xs font-bold text-slate-600 hover:text-indigo-600">Manual</button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'users' && (
                    <>
                        <div className="flex justify-between mb-6">
                            <h1 className="text-3xl font-black">Data Peserta</h1>
                            <div className="flex gap-2">
                                <label className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer flex items-center gap-2 hover:bg-blue-700 transition-all"><Upload size={18}/> Passing Grade<input type="file" className="hidden" onChange={handleUploadPassingGrade}/></label>
                                <label className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer flex items-center gap-2 hover:bg-emerald-700 transition-all"><FileSpreadsheet size={18}/> Import Peserta<input type="file" className="hidden" onChange={handleImportUser}/></label>
                                <button onClick={()=>setShowUserModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all"><Plus size={18}/> Manual</button>
                            </div>
                        </div>
                        <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 font-bold text-slate-500"><tr><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4">Role</th><th className="p-4">Group</th></tr></thead>
                                <tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-4 font-bold">{u.full_name}</td><td className="p-4">{u.username}</td><td className="p-4 uppercase text-xs font-bold text-slate-400">{u.role}</td><td className="p-4"><span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold text-xs">{u.group_code}</span></td></tr>))}</tbody>
                            </table>
                        </div>
                    </>
                )}

                {activeTab === 'lms' && (
                    <>
                        <div className="flex justify-between mb-6">
                            <h1 className="text-3xl font-black">Materi LMS</h1>
                            <button onClick={()=>setShowLmsModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={18}/> Tambah Materi</button>
                        </div>
                        <div className="grid gap-6 md:grid-cols-3">
                            {materials.map(m => (
                                <div key={m.id} className="bg-white p-6 rounded-[2rem] shadow-lg border relative group">
                                    <button onClick={()=>fetch(`${API_URL}/materials/${m.id}`,{method:'DELETE'}).then(refresh)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-500"><Trash2 size={18}/></button>
                                    <div className="mb-4"><span className="text-[10px] font-bold uppercase bg-slate-100 px-2 py-1 rounded">{m.category}</span></div>
                                    <h4 className="font-bold mb-2 text-lg leading-tight">{m.title}</h4>
                                    <a href={m.content_url} target="_blank" rel="noreferrer" className="inline-block mt-4 text-indigo-600 font-bold text-xs border-b-2 border-indigo-100 hover:border-indigo-600 transition-all">BUKA MATERI</a>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>

            {/* MODAL MANUAL INPUT (FIXED) */}
            {showManualModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl h-[90vh] overflow-y-auto shadow-2xl">
                        <h3 className="text-xl font-bold mb-6">Tambah Soal Manual</h3>
                        <div className="space-y-4">
                            <select className="w-full p-3 border rounded-xl" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="PG">Pilihan Ganda</option><option value="TKP">TKP (CPNS)</option><option value="ISIAN">Isian Singkat</option></select>
                            <textarea className="w-full p-4 border rounded-xl h-32" placeholder="Teks Soal (Bisa LaTeX $...$)" value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}></textarea>
                            <textarea className="w-full p-4 border rounded-xl h-24" placeholder="Pembahasan" value={manualQ.explanation} onChange={e=>setManualQ({...manualQ, explanation:e.target.value})}></textarea>
                            <div className="grid grid-cols-2 gap-4">
                                <input className="p-3 border rounded-xl" placeholder="URL Gambar (Opsional)" value={manualQ.media} onChange={e=>setManualQ({...manualQ, media:e.target.value})}/>
                                <input className="p-3 border rounded-xl" type="number" step="0.1" placeholder="Bobot Kesulitan (1.0)" value={manualQ.difficulty} onChange={e=>setManualQ({...manualQ, difficulty:parseFloat(e.target.value)})}/>
                            </div>
                            
                            <div className="space-y-2">
                                <p className="font-bold text-sm">Pilihan Jawaban</p>
                                {manualQ.options.map((opt, idx) => (
                                    <div key={idx} className="flex gap-2 items-center">
                                        <input type="checkbox" checked={opt.is_correct} onChange={e=>{const newOpts=[...manualQ.options]; newOpts[idx].is_correct=e.target.checked; setManualQ({...manualQ, options:newOpts})}}/>
                                        <span className="font-bold w-6">{opt.idx}</span>
                                        <input className="flex-1 p-2 border rounded-lg" value={opt.label} onChange={e=>{const newOpts=[...manualQ.options]; newOpts[idx].label=e.target.value; setManualQ({...manualQ, options:newOpts})}} placeholder={`Opsi ${opt.idx}`}/>
                                        <input className="w-16 p-2 border rounded-lg" type="number" placeholder="Bobot" value={opt.score_weight||0} onChange={e=>{const newOpts=[...manualQ.options]; newOpts[idx].score_weight=parseInt(e.target.value); setManualQ({...manualQ, options:newOpts})}}/>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={()=>setShowManualModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Batal</button>
                            <button onClick={saveManualQuestion} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan Soal</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL LAINNYA (USER, PERIOD, LMS) */}
            {showUserModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddUser} className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Tambah Peserta</h3><div className="space-y-3"><input className="w-full p-3 border rounded-xl" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})} required/><input className="w-full p-3 border rounded-xl" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} required/><input className="w-full p-3 border rounded-xl" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} required/><input className="w-full p-3 border rounded-xl" placeholder="Kode Grup (Opsional)" value={newUser.group} onChange={e=>setNewUser({...newUser, group: e.target.value})}/><select className="w-full p-3 border rounded-xl bg-white" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}><option value="peserta">Peserta</option><option value="admin">Admin</option></select></div><div className="flex gap-2 mt-6"><button type="button" onClick={()=>setShowUserModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Batal</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button></div></form></div>}
            
            {showPeriodModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Paket Ujian Baru</h3><div className="space-y-3"><input className="w-full p-3 border rounded-xl" placeholder="Nama Paket" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name:e.target.value})}/><select className="w-full p-3 border rounded-xl bg-white" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option><option value="MANDIRI">MANDIRI</option></select><input className="w-full p-3 border rounded-xl" placeholder="Kode Akses (Opsional)" value={newPeriod.access_code} onChange={e=>setNewPeriod({...newPeriod, access_code:e.target.value})}/><div className="flex items-center gap-2"><input type="checkbox" checked={newPeriod.show_result} onChange={e=>setNewPeriod({...newPeriod, show_result:e.target.checked})}/><label className="text-sm">Tampilkan Nilai</label></div><div className="flex items-center gap-2"><input type="checkbox" checked={newPeriod.can_finish_early} onChange={e=>setNewPeriod({...newPeriod, can_finish_early:e.target.checked})}/><label className="text-sm">Boleh Selesai Awal</label></div></div><div className="flex gap-2 mt-6"><button onClick={()=>setShowPeriodModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Batal</button><button onClick={createPeriod} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Buat</button></div></div></div>}
            
            {showLmsModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddLms} className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Tambah Materi LMS</h3><div className="space-y-4"><input className="w-full p-4 bg-slate-50 border rounded-xl font-bold" placeholder="Judul Materi" value={newLms.title} onChange={e=>setNewLms({...newLms, title: e.target.value})}/><select className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={newLms.category} onChange={e=>setNewLms({...newLms, category: e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option><option value="MANDIRI">MANDIRI</option></select><select className="w-full p-4 bg-slate-50 border rounded-xl font-bold" value={newLms.type} onChange={e=>setNewLms({...newLms, type: e.target.value})}><option value="video">Video</option><option value="pdf">PDF/Dokumen</option></select><input className="w-full p-4 bg-slate-50 border rounded-xl" placeholder="Link URL" value={newLms.url} onChange={e=>setNewLms({...newLms, url: e.target.value})}/></div><div className="flex gap-2 mt-6"><button type="button" onClick={()=>setShowLmsModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold text-slate-500">Batal</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg">Simpan</button></div></form></div>}
            
            {previewExamId && (<div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm"><div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] overflow-hidden flex flex-col relative"><div className="bg-indigo-900 p-6 flex justify-between items-center text-white"><h3 className="font-bold text-xl">Preview Soal</h3><button onClick={()=>setPreviewExamId(null)} className="p-2 bg-white/10 rounded-full hover:bg-rose-500"><X size={20}/></button></div><div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">{previewQuestions.map((q, i) => (<div key={q.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200"><div className="font-bold text-indigo-600 mb-2">NO {i+1} ({q.type})</div>{q.passage && <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-sm font-serif leading-relaxed whitespace-pre-wrap"><RenderPreview text={q.passage}/></div>}{q.media && <img src={q.media} alt="Soal" className="h-32 object-contain mb-4 border rounded"/>}<div className="text-lg font-medium mb-4"><RenderPreview text={q.text}/></div><div className="grid gap-2">{q.options.map(o => (<div key={o.id} className={`p-3 border rounded-xl flex gap-3 items-center ${o.is_correct?'bg-emerald-50 border-emerald-200':''}`}><span className="font-bold w-6 h-6 bg-slate-200 flex items-center justify-center rounded-full text-xs">{o.id}</span><RenderPreview text={o.label}/>{o.score_weight>0 && <span className="text-xs font-bold text-indigo-500">({o.score_weight} Poin)</span>}</div>))}</div></div>))}</div></div></div>)}
        </div>
    );
};
export default AdminDashboard;