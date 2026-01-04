import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, Upload, Eye, X, BarChart2, FileSpreadsheet, Edit, LogOut, Save, ChevronDown, CheckCircle } from 'lucide-react';
import { API_URL } from './config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const RenderPreview = ({ text }) => {
    if (!text) return null;
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span className="text-slate-800 leading-relaxed">
            {parts.map((part, index) => {
                if (part.startsWith('$') && part.endsWith('$')) {
                    return <InlineMath key={index} math={part.slice(1, -1)} />;
                }
                let htmlContent = part
                    .replace(/\[B\](.*?)\[\/B\]/g, '<b>$1</b>')
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\[I\](.*?)\[\/I\]/g, '<i>$1</i>')
                    .replace(/\*(.*?)\*/g, '<i>$1</i>')
                    .replace(/\n/g, '<br/>');
                return <span key={index} dangerouslySetInnerHTML={{ __html: htmlContent }} />;
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

    // FORM STATES
    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'peserta', group: 'GENERAL', allowed: 'ALL' });
    const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK', access_code: 'ALL', show_result: true, can_finish_early: true });
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', subcategory: 'PU', url: '', folder_name: '' });
    
    // MANUAL QUESTION STATE
    const [manualQ, setManualQ] = useState({ 
        id: null, text: '', type: 'PG', explanation: '', difficulty: 1.0, media: '',
        options: [{idx:'A', label:'', is_correct:false, score_weight:0}, {idx:'B', label:'', is_correct:false, score_weight:0}, {idx:'C', label:'', is_correct:false, score_weight:0}, {idx:'D', label:'', is_correct:false, score_weight:0}, {idx:'E', label:'', is_correct:false, score_weight:0}] 
    });
    const [manualExamId, setManualExamId] = useState(null);

    // MODAL STATES
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [showLmsModal, setShowLmsModal] = useState(false);
    const [previewExamId, setPreviewExamId] = useState(null);
    const [previewQuestions, setPreviewQuestions] = useState([]);

    const refreshData = useCallback(() => {
        fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>Array.isArray(d)?setUsers(d):setUsers([]));
        fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>Array.isArray(d)?setPeriods(d):setPeriods([]));
        fetch(`${API_URL}/materials`).then(r=>r.json()).then(d=>Array.isArray(d)?setMaterials(d):setMaterials([]));
    }, []);

    useEffect(() => { refreshData(); }, [refreshData]);

    // HANDLERS
    const handleAddUser = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)})
        .then(()=>{ setShowUserModal(false); refreshData(); alert("User Ditambah!"); });
    };

    const handleImportUser = (e) => {
        const f = new FormData(); f.append('file', e.target.files[0]);
        fetch(`${API_URL}/admin/users/bulk`, {method:'POST', body:f}).then(()=>{ refreshData(); alert("Import Sukses!"); });
    };

    const handleAddLms = (e) => {
        e.preventDefault();
        const f = new FormData();
        f.append('title', newLms.title); f.append('type', newLms.type);
        f.append('category', newLms.category); f.append('subcategory', newLms.subcategory);
        f.append('url', newLms.url); f.append('folder_name', newLms.folder_name);
        fetch(`${API_URL}/materials`, {method:'POST', body:f}).then(()=>{ setShowLmsModal(false); refreshData(); alert("Materi Ditambah!"); });
    };

    const createPeriod = () => {
        const f = new FormData();
        f.append('name', newPeriod.name); f.append('exam_type', newPeriod.exam_type);
        f.append('allowed_groups', newPeriod.access_code);
        f.append('show_result', newPeriod.show_result); f.append('can_finish_early', newPeriod.can_finish_early);
        fetch(`${API_URL}/admin/periods`, {method:'POST', body:f}).then(()=>{ setShowPeriodModal(false); refreshData(); });
    };

    const deletePeriod = (pid) => { if(window.confirm("Hapus paket?")) fetch(`${API_URL}/admin/periods/${pid}`, {method:'DELETE'}).then(refreshData); };
    
    const showStats = (eid) => { fetch(`${API_URL}/admin/analytics/${eid}`).then(r=>r.json()).then(setAnalytics); };
    
    const openManualInput = (eid, qData=null) => {
        setManualExamId(eid);
        if(qData) setManualQ({...qData, options: qData.options.map(o=>({idx:o.id, label:o.label, is_correct:o.is_correct, score_weight:o.score_weight}))});
        else setManualQ({ id: null, text: '', type: 'PG', explanation: '', difficulty: 1.0, media: '', options: [{idx:'A', label:'', is_correct:false, score_weight:0}, {idx:'B', label:'', is_correct:false, score_weight:0}, {idx:'C', label:'', is_correct:false, score_weight:0}, {idx:'D', label:'', is_correct:false, score_weight:0}, {idx:'E', label:'', is_correct:false, score_weight:0}] });
        setShowManualModal(true);
    };

    const saveManualQuestion = () => {
        const url = manualQ.id ? `${API_URL}/admin/questions/${manualQ.id}` : `${API_URL}/admin/exams/${manualExamId}/manual`;
        const method = manualQ.id ? 'PUT' : 'POST';
        fetch(url, {method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(manualQ)})
        .then(()=>{ alert("Tersimpan!"); setShowManualModal(false); if(previewExamId) openPreview(previewExamId); });
    };

    const openPreview = (eid) => { fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{ setPreviewQuestions(d.questions); setPreviewExamId(eid); setManualExamId(eid); }); };
    const handleUploadSoal = (eid, file) => { const f=new FormData(); f.append('file', file); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:f}).then(()=>alert("Uploaded!")); };
    const handleUploadPG = (file) => { const f=new FormData(); f.append('file', file); fetch(`${API_URL}/admin/majors/bulk`, {method:'POST', body:f}).then(()=>alert("PG Updated!")); };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <aside className="w-64 bg-white border-r p-6 flex flex-col fixed inset-y-0 z-20 shadow-xl">
                <h2 className="font-black text-2xl mb-8 text-indigo-600">EduPrime</h2>
                <nav className="space-y-2 flex-1">
                    <button onClick={()=>setActiveTab('exams')} className={`w-full text-left p-4 font-bold rounded-2xl flex items-center gap-3 ${activeTab==='exams'?'bg-indigo-600 text-white':'hover:bg-slate-50 text-slate-500'}`}><Database size={20}/> Bank Soal</button>
                    <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-4 font-bold rounded-2xl flex items-center gap-3 ${activeTab==='users'?'bg-indigo-600 text-white':'hover:bg-slate-50 text-slate-500'}`}><Users size={20}/> Peserta</button>
                    <button onClick={()=>setActiveTab('lms')} className={`w-full text-left p-4 font-bold rounded-2xl flex items-center gap-3 ${activeTab==='lms'?'bg-indigo-600 text-white':'hover:bg-slate-50 text-slate-500'}`}><BookOpen size={20}/> Materi LMS</button>
                </nav>
                <button onClick={onLogout} className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center justify-center gap-2"><LogOut size={20}/> Keluar</button>
            </aside>

            <main className="flex-1 p-10 ml-64 overflow-y-auto min-h-screen">
                {/* TAB BANK SOAL */}
                {activeTab === 'exams' && (
                    <>
                        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-black">Bank Soal</h1><button onClick={()=>setShowPeriodModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2"><Plus size={18}/> Buat Paket</button></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{periods.map(p => (<div key={p.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"><div className="flex justify-between mb-6"><div><h3 className="font-black text-xl">{p.name}</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded">{p.exam_type} ({p.allowed_groups})</span></div><button onClick={()=>deletePeriod(p.id)} className="text-rose-400"><Trash2/></button></div><div className="space-y-3">{p.exams.map(e => (<div key={e.id} className="flex gap-2 items-center p-4 border rounded-2xl bg-slate-50"><span className="flex-1 font-bold text-xs">{e.title}</span><button onClick={()=>showStats(e.id)} className="p-2 bg-white border rounded"><BarChart2 size={16}/></button><button onClick={()=>openPreview(e.id)} className="p-2 bg-white border rounded"><Eye size={16}/></button><label className="p-2 bg-white border rounded cursor-pointer"><Upload size={16}/><input type="file" className="hidden" onChange={x=>handleUploadSoal(e.id, x.target.files[0])}/></label><button onClick={()=>openManualInput(e.id)} className="p-2 bg-white border rounded text-xs font-bold">Edit</button></div>))}</div></div>))}</div>
                    </>
                )}

                {/* TAB USERS */}
                {activeTab === 'users' && (
                    <>
                        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-black">Peserta</h1><div className="flex gap-2"><label className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer flex gap-2"><FileSpreadsheet size={18}/> Import User<input type="file" className="hidden" onChange={handleImportUser}/></label><label className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold cursor-pointer flex gap-2"><Upload size={18}/> Import PG<input type="file" className="hidden" onChange={handleUploadPG}/></label><button onClick={()=>setShowUserModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex gap-2"><Plus size={18}/> Manual</button></div></div>
                        <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 font-bold text-slate-500"><tr><th className="p-6">Nama</th><th className="p-6">ID</th><th className="p-6">Role</th><th className="p-6">Grup</th></tr></thead><tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-6 font-bold">{u.full_name}</td><td className="p-6">{u.username}</td><td className="p-6">{u.role}</td><td className="p-6">{u.group_code}</td></tr>))}</tbody></table></div>
                    </>
                )}

                {/* TAB LMS */}
                {activeTab === 'lms' && (
                    <>
                        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-black">LMS</h1><button onClick={()=>setShowLmsModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex gap-2"><Plus size={18}/> Tambah</button></div>
                        <div className="grid gap-6 md:grid-cols-3">{materials.map(m => (<div key={m.id} className="bg-white p-6 rounded-[2rem] shadow border relative"><button onClick={()=>fetch(`${API_URL}/materials/${m.id}`,{method:'DELETE'}).then(refreshData)} className="absolute top-6 right-6 text-rose-400"><Trash2/></button><div className="mb-4 text-xs font-bold uppercase text-indigo-500">{m.folder?.category} / {m.folder?.subcategory}</div><h4 className="font-bold text-lg mb-4">{m.title}</h4><a href={m.content_url} target="_blank" rel="noreferrer" className="block w-full py-2 bg-slate-900 text-white text-center rounded-xl font-bold text-xs">BUKA</a></div>))}</div>
                    </>
                )}
            </main>

            {/* MODALS */}
            {analytics && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative">
                        <button onClick={()=>setAnalytics(null)} className="absolute top-6 right-6"><X/></button>
                        <h3 className="font-bold text-xl mb-6">Analisis Hasil</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div><h4 className="font-bold text-sm text-slate-400 mb-4">Top 10</h4>{analytics.leaderboard.map((l,i)=>(<div key={i} className="flex justify-between p-2 border-b"><span className="font-bold">#{i+1} {l.name}</span><span className="font-black text-indigo-600">{l.score}</span></div>))}</div>
                            <div className="h-64"><h4 className="font-bold text-sm text-slate-400 mb-4">Statistik Soal</h4><ResponsiveContainer><BarChart data={analytics.stats}><XAxis dataKey="no"/><YAxis/><Tooltip/><Bar dataKey="pct" fill="#6366f1" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer></div>
                        </div>
                    </div>
                </div>
            )}
            
            {showUserModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddUser} className="bg-white p-8 rounded-[2rem] w-full max-w-sm"><h3 className="text-xl font-bold mb-6">Tambah User</h3><input className="w-full p-3 border rounded-xl mb-3" placeholder="Nama" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/><input className="w-full p-3 border rounded-xl mb-3" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/><input className="w-full p-3 border rounded-xl mb-3" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/><div className="flex gap-2"><button onClick={()=>setShowUserModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Batal</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button></div></form></div>}

            {showPeriodModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white p-8 rounded-[2rem] w-full max-w-sm"><h3 className="text-xl font-bold mb-6">Paket Baru</h3><input className="w-full p-3 border rounded-xl mb-3" placeholder="Nama Paket" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name:e.target.value})}/><select className="w-full p-3 border rounded-xl mb-3" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option></select><input className="w-full p-3 border rounded-xl mb-3" placeholder="Akses Grup (ALL / Kode)" value={newPeriod.access_code} onChange={e=>setNewPeriod({...newPeriod, access_code:e.target.value})}/><div className="flex items-center gap-2 mb-2"><input type="checkbox" checked={newPeriod.show_result} onChange={e=>setNewPeriod({...newPeriod, show_result:e.target.checked})}/><label className="text-sm">Show Result</label></div><div className="flex items-center gap-2 mb-4"><input type="checkbox" checked={newPeriod.can_finish_early} onChange={e=>setNewPeriod({...newPeriod, can_finish_early:e.target.checked})}/><label className="text-sm">Finish Early</label></div><div className="flex gap-2"><button onClick={()=>setShowPeriodModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Batal</button><button onClick={createPeriod} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Buat</button></div></div></div>}

            {showLmsModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddLms} className="bg-white p-8 rounded-[2rem] w-full max-w-sm"><h3 className="text-xl font-bold mb-6">Tambah LMS</h3><input className="w-full p-3 border rounded-xl mb-3" placeholder="Judul" value={newLms.title} onChange={e=>setNewLms({...newLms, title:e.target.value})}/><select className="w-full p-3 border rounded-xl mb-3" value={newLms.category} onChange={e=>setNewLms({...newLms, category:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option></select><input className="w-full p-3 border rounded-xl mb-3" placeholder="Folder Name" value={newLms.folder_name} onChange={e=>setNewLms({...newLms, folder_name:e.target.value})}/><input className="w-full p-3 border rounded-xl mb-3" placeholder="URL" value={newLms.url} onChange={e=>setNewLms({...newLms, url:e.target.value})}/><div className="flex gap-2"><button onClick={()=>setShowLmsModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Batal</button><button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button></div></form></div>}

            {/* PREVIEW & MANUAL INPUT MODALS (KEEP AS IS, THEY WERE CORRECT BUT TRUNCATED IN THOUGHTS) */}
            {previewExamId && <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100]"><div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] overflow-hidden flex flex-col"><div className="bg-indigo-900 p-6 flex justify-between items-center text-white"><h3 className="font-bold text-xl">Preview</h3><button onClick={()=>setPreviewExamId(null)}><X/></button></div><div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">{previewQuestions.map((q,i)=>(<div key={q.id} className="bg-white p-6 rounded-2xl shadow border relative"><button onClick={()=>openManualInput(previewExamId, q)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded hover:bg-indigo-100"><Edit size={16}/></button><div className="font-bold text-indigo-600 mb-2">No {i+1} ({q.type})</div><div><RenderPreview text={q.text}/></div><div className="grid gap-2 mt-4">{q.options.map(o=>(<div key={o.id} className={`p-3 border rounded flex gap-3 ${o.is_correct?'bg-emerald-50 border-emerald-500':''}`}><span className="font-bold">{o.id}</span><RenderPreview text={o.label}/></div>))}</div></div>))}</div></div></div>}
            
            {showManualModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl h-[90vh] overflow-y-auto"><h3 className="text-xl font-bold mb-6">Editor Soal</h3><select className="w-full p-3 border rounded-xl mb-3" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="PG">PG</option><option value="TKP">TKP</option><option value="ISIAN">ISIAN</option></select><textarea className="w-full p-3 border rounded-xl h-32 mb-3" placeholder="Soal" value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/><div className="space-y-2">{manualQ.options.map((opt, idx) => (<div key={idx} className="flex gap-2 items-center"><input type="checkbox" checked={opt.is_correct} onChange={e=>{const n=[...manualQ.options]; n[idx].is_correct=e.target.checked; setManualQ({...manualQ, options:n})}}/><input className="flex-1 p-2 border rounded" value={opt.label} onChange={e=>{const n=[...manualQ.options]; n[idx].label=e.target.value; setManualQ({...manualQ, options:n})}}/><input className="w-16 p-2 border rounded" type="number" placeholder="Bobot" value={opt.score_weight} onChange={e=>{const n=[...manualQ.options]; n[idx].score_weight=parseInt(e.target.value); setManualQ({...manualQ, options:n})}}/></div>))}</div><div className="flex gap-2 mt-6"><button onClick={()=>setShowManualModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Batal</button><button onClick={saveManualQuestion} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button></div></div></div>}
        </div>
    );
};
export default AdminDashboard;