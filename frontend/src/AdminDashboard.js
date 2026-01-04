import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, Upload, Eye, X, BarChart2, FileSpreadsheet, Edit, LogOut } from 'lucide-react';
import { API_URL } from './config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

const RenderPreview = ({ text }) => { if (!text) return null; const parts = text.split(/(\$[^$]+\$)/g); return (<span>{parts.map((part, index) => { if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />; return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*(.*?)\*/g, '<i>$1</i>') }} />; })}</span>); };

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('exams'); 
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    
    // Forms
    const [newUser, setNewUser] = useState({username:'', full_name:'', password:'', role:'peserta', group:'GENERAL', allowed:'ALL'});
    const [newPeriod, setNewPeriod] = useState({name:'', exam_type:'UTBK', access_code:'ALL', show_result:true, can_finish_early:true});
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', subcategory:'PU', url: '', folder_name: '' });
    
    // Manual Edit
    const [manualQ, setManualQ] = useState({ id: null, text: '', type: 'PG', explanation: '', difficulty: 1.0, options: [{idx:'A', label:'', is_correct:false, score_weight:0}, {idx:'B', label:'', is_correct:false, score_weight:0}, {idx:'C', label:'', is_correct:false, score_weight:0}, {idx:'D', label:'', is_correct:false, score_weight:0}, {idx:'E', label:'', is_correct:false, score_weight:0}] });
    const [manualExamId, setManualExamId] = useState(null);

    // Modals
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

    const showStats = (eid) => { fetch(`${API_URL}/admin/analytics/${eid}`).then(r=>r.json()).then(setAnalytics); };
    const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(()=>{ setShowUserModal(false); refresh(); }); };
    const handleImportUser = (e) => { const f=new FormData(); f.append('file',e.target.files[0]); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:f}).then(refresh); };
    const createPeriod = () => { const f=new FormData(); f.append('name',newPeriod.name); f.append('exam_type',newPeriod.exam_type); f.append('allowed_groups',newPeriod.access_code); f.append('show_result', newPeriod.show_result); f.append('can_finish_early', newPeriod.can_finish_early); fetch(`${API_URL}/admin/periods`,{method:'POST',body:f}).then(()=>{setShowPeriodModal(false);refresh()}); };
    const handleUploadSoal = (eid, file) => { const f = new FormData(); f.append('file', file); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:f}).then(()=>alert("Sukses Upload!")); };
    const openPreview = (eid) => { fetch(`${API_URL}/exams/${eid}`).then(r=>r.json()).then(d => { setPreviewQuestions(d.questions); setPreviewExamId(eid); setManualExamId(eid); }); };
    
    const openManualInput = (eid, qData=null) => { 
        setManualExamId(eid); 
        if (qData) {
            setManualQ({
                id: qData.id, text: qData.text, type: qData.type, explanation: qData.explanation || '', difficulty: 1.0, media: qData.media,
                options: qData.options.length ? qData.options.map(o=>({idx:o.id, label:o.label, is_correct:o.is_correct, score_weight:o.score_weight})) : manualQ.options
            });
        } else {
            setManualQ({ id: null, text: '', type: 'PG', explanation: '', difficulty: 1.0, options: [{idx:'A', label:'', is_correct:false, score_weight:0}, {idx:'B', label:'', is_correct:false, score_weight:0}, {idx:'C', label:'', is_correct:false, score_weight:0}, {idx:'D', label:'', is_correct:false, score_weight:0}, {idx:'E', label:'', is_correct:false, score_weight:0}] });
        }
        setShowManualModal(true); 
    };

    const saveManualQuestion = () => { 
        const url = manualQ.id ? `${API_URL}/admin/questions/${manualQ.id}` : `${API_URL}/admin/exams/${manualExamId}/manual`;
        const method = manualQ.id ? 'PUT' : 'POST';
        fetch(url, {method, headers: {'Content-Type':'application/json'}, body: JSON.stringify(manualQ)}).then(() => { alert("Tersimpan!"); setShowManualModal(false); if(previewExamId) openPreview(previewExamId); }); 
    };

    const handleAddLms = (e) => { e.preventDefault(); const f=new FormData();f.append('title',newLms.title);f.append('type',newLms.type);f.append('category',newLms.category);f.append('subcategory',newLms.subcategory);f.append('url',newLms.url); f.append('folder_name', newLms.folder_name); fetch(`${API_URL}/materials`,{method:'POST',body:f}).then(()=>{setShowLmsModal(false);refresh()}); };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <aside className="w-64 bg-white border-r p-6 flex flex-col fixed inset-y-0 z-10 shadow-xl">
                <h2 className="font-black text-2xl mb-8 text-indigo-600">EduPrime</h2>
                <nav className="space-y-3 flex-1">
                    <button onClick={()=>setActiveTab('exams')} className={`w-full text-left p-4 font-bold rounded-2xl flex gap-3 ${activeTab==='exams'?'bg-indigo-600 text-white':'hover:bg-slate-50'}`}><Database/> Bank Soal</button>
                    <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-4 font-bold rounded-2xl flex gap-3 ${activeTab==='users'?'bg-indigo-600 text-white':'hover:bg-slate-50'}`}><Users/> Peserta</button>
                    <button onClick={()=>setActiveTab('lms')} className={`w-full text-left p-4 font-bold rounded-2xl flex gap-3 ${activeTab==='lms'?'bg-indigo-600 text-white':'hover:bg-slate-50'}`}><BookOpen/> Materi LMS</button>
                </nav>
                <button onClick={onLogout} className="p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold flex items-center gap-3 hover:bg-rose-600 hover:text-white"><LogOut/> Keluar</button>
            </aside>

            <main className="flex-1 p-10 ml-64 overflow-y-auto min-h-screen">
                {activeTab === 'exams' && (
                    <>
                        <div className="flex justify-between items-center mb-8"><h1 className="text-4xl font-black text-slate-800">Bank Soal</h1><button onClick={()=>setShowPeriodModal(true)} className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold flex items-center gap-3 shadow-xl"><Plus/> Buat Paket</button></div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">{periods.map(p => (<div key={p.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border hover:shadow-xl"><div className="flex justify-between mb-6"><div><h3 className="font-black text-xl">{p.name}</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded">{p.exam_type} ({p.allowed_groups})</span></div><button onClick={()=>fetch(`${API_URL}/admin/periods/${p.id}`,{method:'DELETE'}).then(refresh)}><Trash2 className="text-rose-400"/></button></div><div className="space-y-3">{p.exams.map(e => (<div key={e.id} className="flex gap-2 items-center p-4 border rounded-2xl bg-slate-50"><span className="flex-1 font-bold text-xs">{e.title}</span><button onClick={()=>showStats(e.id)} className="p-2 border rounded-xl bg-white"><BarChart2 size={16}/></button><button onClick={()=>openPreview(e.id)} className="p-2 border rounded-xl bg-white"><Eye size={16}/></button><label className="p-2 border rounded-xl bg-white cursor-pointer"><Upload size={16}/><input type="file" className="hidden" onChange={x=>handleUploadSoal(e.id, x.target.files[0])}/></label><button onClick={()=>openManualInput(e.id)} className="p-2 border rounded-xl bg-indigo-600 text-white text-xs font-bold px-3">Edit</button></div>))}</div></div>))}</div>
                    </>
                )}
                {/* ... Users & LMS Tabs (Sama seperti V57) ... */}
                {activeTab === 'users' && (<div className="bg-white rounded-[2.5rem] shadow-sm border overflow-hidden"><table className="w-full text-left text-sm"><thead className="bg-slate-50 font-black text-slate-400 uppercase"><tr><th className="p-6">Nama</th><th className="p-6">ID</th><th className="p-6">Role</th><th className="p-6">Akses Paket</th></tr></thead><tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-6 font-bold">{u.full_name}</td><td className="p-6">{u.username}</td><td className="p-6 uppercase">{u.role}</td><td className="p-6"><span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg font-bold text-xs">{u.allowed_exam_ids || 'ALL'}</span></td></tr>))}</tbody></table></div>)}
            </main>

            {showPeriodModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"><div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl"><h3 className="text-xl font-bold mb-6">Paket Ujian Baru</h3><div className="space-y-3"><input className="w-full p-4 border rounded-2xl" placeholder="Nama Paket" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name:e.target.value})}/><select className="w-full p-4 border rounded-2xl" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option></select><input className="w-full p-4 border rounded-2xl" placeholder="Akses User (ALL / ID Paket User)" value={newPeriod.access_code} onChange={e=>setNewPeriod({...newPeriod, access_code:e.target.value})}/></div><div className="flex gap-3 mt-6"><button onClick={()=>setShowPeriodModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-bold">Batal</button><button onClick={createPeriod} className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold">Buat</button></div></div></div>)}
            
            {showManualModal && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]"><div className="bg-white p-8 rounded-[2rem] w-full max-w-2xl h-[90vh] overflow-y-auto"><h3 className="text-xl font-bold mb-6">Editor Soal</h3><div className="space-y-4"><select className="w-full p-4 border rounded-2xl" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type:e.target.value})}><option value="PG">Pilihan Ganda</option><option value="TKP">TKP (CPNS)</option><option value="ISIAN">Isian Singkat</option></select><textarea className="w-full p-4 border rounded-2xl h-32" placeholder="Soal" value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/><div className="space-y-2">{manualQ.options.map((opt, idx) => (<div key={idx} className="flex gap-2 items-center"><input type="checkbox" className="w-6 h-6" checked={opt.is_correct} onChange={e=>{const n=[...manualQ.options]; n[idx].is_correct=e.target.checked; setManualQ({...manualQ, options:n})}}/><input className="flex-1 p-3 border rounded-xl" value={opt.label} onChange={e=>{const n=[...manualQ.options]; n[idx].label=e.target.value; setManualQ({...manualQ, options:n})}}/><input className="w-20 p-3 border rounded-xl" type="number" placeholder="Bobot" value={opt.score_weight} onChange={e=>{const n=[...manualQ.options]; n[idx].score_weight=parseInt(e.target.value); setManualQ({...manualQ, options:n})}}/></div>))}</div></div><div className="flex gap-3 mt-6"><button onClick={()=>setShowManualModal(false)} className="flex-1 p-4 bg-slate-100 rounded-2xl font-bold">Batal</button><button onClick={saveManualQuestion} className="flex-1 p-4 bg-indigo-600 text-white rounded-2xl font-bold">Simpan</button></div></div></div>)}
            
            {previewExamId && (<div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-[100]"><div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] overflow-hidden flex flex-col"><div className="bg-indigo-900 p-6 flex justify-between items-center text-white"><h3 className="font-bold text-xl">Preview</h3><button onClick={()=>setPreviewExamId(null)}><X/></button></div><div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50">{previewQuestions.map((q,i)=>(<div key={q.id} className="bg-white p-6 rounded-2xl shadow border relative"><button onClick={()=>openManualInput(previewExamId, q)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded hover:bg-indigo-100"><Edit size={16}/></button><div className="font-bold text-indigo-600 mb-2">No {i+1} ({q.type})</div><div><RenderPreview text={q.text}/></div><div className="grid gap-2 mt-4">{q.options.map(o=>(<div key={o.id} className={`p-3 border rounded flex gap-3 ${o.is_correct?'bg-emerald-50 border-emerald-500':''}`}><span className="font-bold">{o.id}</span><RenderPreview text={o.label}/>{o.score_weight>0 && <span className="ml-auto text-xs bg-indigo-100 px-2 rounded">Bobot: {o.score_weight}</span>}</div>))}</div></div>))}</div></div></div>)}
        </div>
    );
};
export default AdminDashboard;