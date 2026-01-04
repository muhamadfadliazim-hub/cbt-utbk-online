import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, Upload, Eye, LogOut } from 'lucide-react';
import { API_URL } from './config';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

// Utilitas Render Teks Kaya (Markdown/LaTeX/HTML)
const RenderPreview = ({ text }) => {
    if (!text) return <span className="text-gray-400 italic">Kosong...</span>;
    const parts = text.split(/(\$[^$]+\$)/g);
    return (
        <span className="leading-relaxed">
            {parts.map((p, i) => {
                if (p.startsWith('$')) return <InlineMath key={i} math={p.slice(1, -1)} />;
                return <span key={i} dangerouslySetInnerHTML={{ 
                    __html: p.replace(/\n/g, '<br/>')
                             .replace(/\[b\](.*?)\[\/b\]/gi, '<b>$1</b>')
                             .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                             .replace(/_(.*?)_/g, '<i>$1</i>')
                }} />;
            })}
        </span>
    );
};

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('exams');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    // Upload Excel State
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadExamId, setUploadExamId] = useState(null);

    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'peserta', access_flags: 'ALL' });
    const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK', show_result: true, can_finish_early: true });
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', subcategory: 'PU', url: '', folder_name: '' });
    
    const [manualQ, setManualQ] = useState({ 
        id: null, text: '', type: 'PG', explanation: '', difficulty: 1.0, media: '', 
        table_headers: 'Benar,Salah', options: []
    });
    
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showManualModal, setShowManualModal] = useState(false);
    const [showLmsModal, setShowLmsModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    // eslint-disable-next-line no-unused-vars
    const [previewExamId, setPreviewExamId] = useState(null);
    // eslint-disable-next-line no-unused-vars
    const [previewQuestions, setPreviewQuestions] = useState([]);

    const refreshData = useCallback(() => {
        fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>Array.isArray(d)?setUsers(d):setUsers([]));
        fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>Array.isArray(d)?setPeriods(d):setPeriods([]));
        fetch(`${API_URL}/materials`).then(r=>r.json()).then(d=>Array.isArray(d)?setMaterials(d):setMaterials([]));
    }, []);
    useEffect(() => { refreshData(); }, [refreshData]);

    const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(()=>{ setShowUserModal(false); refreshData(); alert("User OK"); }); };
    const createPeriod = () => { const f = new FormData(); f.append('name', newPeriod.name); f.append('exam_type', newPeriod.exam_type); f.append('show_result', newPeriod.show_result); f.append('can_finish_early', newPeriod.can_finish_early); fetch(`${API_URL}/admin/periods`, {method:'POST', body:f}).then(()=>{ setShowPeriodModal(false); refreshData(); }); };
    const deletePeriod = (pid) => { if(window.confirm("Hapus?")) fetch(`${API_URL}/admin/periods/${pid}`, {method:'DELETE'}).then(refreshData); };
    const handleAddLms = (e) => { e.preventDefault(); const f = new FormData(); f.append('title', newLms.title); f.append('type', newLms.type); f.append('category', newLms.category); f.append('subcategory', newLms.subcategory); f.append('url', newLms.url); f.append('folder_name', newLms.folder_name); fetch(`${API_URL}/materials`, {method:'POST', body:f}).then(()=>{ setShowLmsModal(false); refreshData(); alert("Materi OK"); }); };

    const handleUploadExcel = (e) => {
        e.preventDefault();
        if(!uploadFile || !uploadExamId) return;
        const f = new FormData();
        f.append('file', uploadFile);
        fetch(`${API_URL}/admin/exams/${uploadExamId}/import`, { method: 'POST', body: f })
            .then(r => r.json())
            .then(res => { alert(res.msg || "Upload Sukses"); setShowUploadModal(false); });
    };

    const openManualInput = (eid, qData=null) => {
        setUploadExamId(eid); 
        if(qData) setManualQ({...qData, options: qData.options.map(o=>({idx:o.id, label:o.label, is_correct:o.is_correct, score_weight:o.score_weight, bool_val:o.val}))});
        else setManualQ({ id: null, text: '', type: 'PG', explanation: '', difficulty: 1.0, media: '', table_headers: 'Benar,Salah', options: [{idx:'A', label:'', is_correct:false}, {idx:'B', label:'', is_correct:false}, {idx:'C', label:'', is_correct:false}, {idx:'D', label:'', is_correct:false}, {idx:'E', label:'', is_correct:false}] });
        setShowManualModal(true);
    };

    const saveManualQuestion = () => {
        const url = manualQ.id ? `${API_URL}/admin/questions/${manualQ.id}` : `${API_URL}/admin/exams/${uploadExamId}/manual`;
        const method = manualQ.id ? 'PUT' : 'POST';
        fetch(url, {method, headers:{'Content-Type':'application/json'}, body:JSON.stringify(manualQ)}).then(()=>{ alert("Saved!"); setShowManualModal(false); if(previewExamId) openPreview(previewExamId); });
    };
    const openPreview = (eid) => { fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d=>{ setPreviewQuestions(d.questions); setPreviewExamId(eid); setUploadExamId(eid); }); };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <aside className="w-64 bg-white border-r p-6 flex flex-col fixed inset-y-0 z-20 shadow-xl">
                <div className="mb-8"><h2 className="font-black text-2xl text-indigo-600">EduPrime Pro</h2></div>
                <nav className="space-y-2 flex-1">
                    <button onClick={()=>setActiveTab('exams')} className={`w-full text-left p-4 font-bold rounded-2xl flex items-center gap-3 ${activeTab==='exams'?'bg-indigo-50 text-indigo-600':'hover:bg-slate-50 text-slate-500'}`}><Database size={20}/> Bank Soal</button>
                    <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-4 font-bold rounded-2xl flex items-center gap-3 ${activeTab==='users'?'bg-indigo-50 text-indigo-600':'hover:bg-slate-50 text-slate-500'}`}><Users size={20}/> Peserta</button>
                    <button onClick={()=>setActiveTab('lms')} className={`w-full text-left p-4 font-bold rounded-2xl flex items-center gap-3 ${activeTab==='lms'?'bg-indigo-50 text-indigo-600':'hover:bg-slate-50 text-slate-500'}`}><BookOpen size={20}/> LMS</button>
                </nav>
                <button onClick={onLogout} className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center justify-center gap-2"><LogOut size={20}/> Keluar</button>
            </aside>
            <main className="flex-1 p-10 ml-64 overflow-y-auto min-h-screen">
                {activeTab === 'exams' && (
                    <>
                        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-black">Bank Soal</h1><button onClick={()=>setShowPeriodModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-2"><Plus/> Paket Baru</button></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{periods.map(p => (<div key={p.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100"><div className="flex justify-between mb-6"><div><h3 className="font-black text-xl">{p.name}</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">{p.exam_type}</span></div><button onClick={()=>deletePeriod(p.id)} className="text-rose-400"><Trash2/></button></div><div className="space-y-3">{p.exams.map(e => (<div key={e.id} className="flex gap-2 items-center p-4 border rounded-2xl bg-slate-50"><span className="flex-1 font-bold text-xs">{e.title}</span>
                            <button onClick={()=>{setUploadExamId(e.id); setShowUploadModal(true)}} className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded hover:bg-emerald-100" title="Upload Excel"><Upload size={16}/></button>
                            <button onClick={()=>openPreview(e.id)} className="p-2 bg-white border rounded"><Eye size={16}/></button>
                            <button onClick={()=>openManualInput(e.id)} className="p-2 bg-white border rounded text-xs font-bold">Edit</button></div>))}</div></div>))}</div>
                    </>
                )}
                {activeTab === 'users' && (
                    <>
                        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-black">Peserta</h1><button onClick={()=>setShowUserModal(true)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold flex gap-2"><Plus size={18}/> Manual</button></div>
                        <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
                            <table className="w-full text-left text-sm"><thead className="bg-slate-50 font-bold text-slate-500"><tr><th className="p-6">Nama</th><th className="p-6">ID</th><th className="p-6">Akses</th></tr></thead>
                            <tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-6 font-bold">{u.full_name}</td><td className="p-6">{u.username}</td><td className="p-6">{u.access_flags}</td></tr>))}</tbody></table>
                        </div>
                    </>
                )}
                {activeTab === 'lms' && (
                    <>
                        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-black">LMS</h1><button onClick={()=>setShowLmsModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold flex gap-2"><Plus size={18}/> Tambah</button></div>
                        <div className="grid gap-6 md:grid-cols-3">{materials.map(m => (<div key={m.id} className="bg-white p-6 rounded-[2rem] shadow border relative"><div className="mb-4 text-xs font-bold uppercase text-indigo-500">{m.folder?.category} / {m.folder?.subcategory}</div><h4 className="font-bold text-lg mb-4">{m.title}</h4></div>))}</div>
                    </>
                )}
            </main>

            {showUploadModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleUploadExcel} className="bg-white p-8 rounded-[2rem] w-full max-w-sm space-y-4 text-center"><h3 className="font-bold text-lg">Upload Soal (Excel/CSV)</h3><p className="text-xs text-slate-500">Format kolom: soal, a, b, c, d, e, kunci, pembahasan</p><input type="file" accept=".xlsx,.csv" onChange={e=>setUploadFile(e.target.files[0])} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/><button className="w-full p-3 bg-emerald-600 text-white rounded-xl font-bold">Upload Sekarang</button><button type="button" onClick={()=>setShowUploadModal(false)} className="w-full p-3 text-slate-400 font-bold">Batal</button></form></div>}

            {showUserModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddUser} className="bg-white p-8 rounded-[2rem] w-full max-w-sm space-y-3"><h3 className="font-bold text-lg">Tambah User</h3><input className="w-full p-3 border rounded-xl" placeholder="Nama" onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Username" onChange={e=>setNewUser({...newUser, username:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Password" onChange={e=>setNewUser({...newUser, password:e.target.value})}/><div className="text-xs text-slate-500">Isi 'ALL' atau pisah koma: 'UTBK,CPNS'</div><input className="w-full p-3 border rounded-xl" placeholder="Akses (ALL/UTBK/CPNS...)" onChange={e=>setNewUser({...newUser, access_flags:e.target.value})}/><button className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button></form></div>}

            {showPeriodModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white p-8 rounded-[2rem] w-full max-w-sm space-y-3"><h3 className="font-bold text-lg">Paket Ujian</h3><input className="w-full p-3 border rounded-xl" placeholder="Nama Paket" onChange={e=>setNewPeriod({...newPeriod, name:e.target.value})}/><select className="w-full p-3 border rounded-xl" onChange={e=>setNewPeriod({...newPeriod, exam_type:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="MANDIRI">MANDIRI</option><option value="TKA">TKA</option></select><button onClick={createPeriod} className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">Buat</button></div></div>}

            {showLmsModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><form onSubmit={handleAddLms} className="bg-white p-8 rounded-[2rem] w-full max-w-sm space-y-3"><h3 className="font-bold text-lg">Materi LMS</h3><input className="w-full p-3 border rounded-xl" placeholder="Judul" onChange={e=>setNewLms({...newLms, title:e.target.value})}/><select className="w-full p-3 border rounded-xl" onChange={e=>setNewLms({...newLms, category:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="MANDIRI">MANDIRI</option></select><input className="w-full p-3 border rounded-xl" placeholder="Subkategori (PU/TWK/UGM)" onChange={e=>setNewLms({...newLms, subcategory:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="Nama Folder" onChange={e=>setNewLms({...newLms, folder_name:e.target.value})}/><input className="w-full p-3 border rounded-xl" placeholder="URL Konten" onChange={e=>setNewLms({...newLms, url:e.target.value})}/><button className="w-full p-3 bg-indigo-600 text-white rounded-xl font-bold">Simpan</button></form></div>}

            {showManualModal && <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl h-[90vh] overflow-y-auto space-y-3">
                <h3 className="text-xl font-bold">Editor Soal</h3>
                <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded">
                    <b>Format Text:</b> Gunakan <code>**tebal**</code>, <code>_miring_</code>, atau <code>$rumus$</code> (LaTeX). <br/>
                    <b>Gambar:</b> Masukkan URL gambar di kolom Media URL.
                </div>
                <select className="w-full p-3 border rounded-xl" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="PG">PG Biasa</option><option value="PG_KOMPLEKS">PG Kompleks</option><option value="ISIAN">Isian Singkat</option><option value="BOOLEAN">Tabel (Benar/Salah)</option><option value="TKP">TKP</option></select>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold">Input Teks Soal</label>
                        <textarea className="w-full p-3 border rounded-xl h-32 font-mono text-sm" value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border h-32 overflow-y-auto">
                        <label className="text-xs font-bold text-indigo-600 block mb-1">Preview Live:</label>
                        <RenderPreview text={manualQ.text} />
                    </div>
                </div>

                <input className="w-full p-3 border rounded-xl" placeholder="URL Gambar (Opsional)" value={manualQ.media} onChange={e=>setManualQ({...manualQ, media:e.target.value})}/>
                <textarea className="w-full p-3 border rounded-xl h-20" placeholder="Pembahasan..." value={manualQ.explanation} onChange={e=>setManualQ({...manualQ, explanation:e.target.value})}/>
                
                <div className="space-y-2">{manualQ.options.map((o, i)=>(<div key={i} className="flex gap-2 items-center"><span className="font-bold w-6">{manualQ.type==='BOOLEAN'?'Br':'Op'}</span><input className="flex-1 p-2 border rounded" value={o.label} onChange={e=>{const ops=[...manualQ.options]; ops[i].label=e.target.value; setManualQ({...manualQ, options:ops})}}/>{manualQ.type!=='BOOLEAN' && <input type="checkbox" checked={o.is_correct} onChange={e=>{const ops=[...manualQ.options]; ops[i].is_correct=e.target.checked; setManualQ({...manualQ, options:ops})}}/>}</div>))}</div>
                
                <div className="flex gap-2 mt-4"><button onClick={()=>setShowManualModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl">Batal</button><button onClick={saveManualQuestion} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl">Simpan</button></div></div></div>}
        </div>
    );
};
export default AdminDashboard;