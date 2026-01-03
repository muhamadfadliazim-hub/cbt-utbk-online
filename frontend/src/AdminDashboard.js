import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, Trash2, Eye, X, FileSpreadsheet, Edit3, Send, GraduationCap, Upload } from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [showManualSoal, setShowManualSoal] = useState(null);
    const [soalData, setSoalData] = useState({ 
        text: '', difficulty: 1.0, explanation: '', 
        options: [
            {idx:'A', label:'', is_correct:true}, {idx:'B', label:'', is_correct:false}, 
            {idx:'C', label:'', is_correct:false}, {idx:'D', label:'', is_correct:false}, {idx:'E', label:'', is_correct:false}
        ]
    });

    const refreshData = useCallback(() => {
        fetch(`${API_URL}/admin/users`)
            .then(r => r.json())
            .then(d => setUsers(Array.isArray(d) ? d : []))
            .catch(() => setUsers([]));
            
        fetch(`${API_URL}/admin/periods`)
            .then(r => r.json())
            .then(d => setPeriods(Array.isArray(d) ? d : []))
            .catch(() => setPeriods([]));
    }, []);

    useEffect(() => { refreshData(); }, [activeTab, refreshData]);

    const handleBulkDelete = () => {
        if (window.confirm("Hapus SELURUH peserta? Data nilai juga akan hilang!")) {
            fetch(`${API_URL}/admin/users/bulk-delete`, { method: 'POST' }).then(refreshData);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-900 overflow-hidden">
            <aside className="w-72 bg-[#0F172A] text-white p-8 flex flex-col shadow-2xl">
                <div className="flex items-center gap-3 mb-12">
                    <div className="bg-indigo-600 p-2 rounded-lg"><GraduationCap size={24}/></div>
                    <h1 className="text-2xl font-black italic tracking-tighter uppercase">EduPrime</h1>
                </div>
                <nav className="space-y-3 flex-1">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'users' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/40' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Users size={20}/> Database Peserta
                    </button>
                    <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'exams' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/40' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Database size={20}/> Bank Soal & TO
                    </button>
                </nav>
                <div className="mt-auto pt-6 border-t border-white/10">
                    <button onClick={onLogout} className="w-full p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-black hover:bg-rose-50 hover:text-white transition-all">LOGOUT</button>
                </div>
            </aside>

            <main className="flex-1 p-12 overflow-y-auto">
                <div className="flex justify-between items-end mb-12">
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 uppercase">{activeTab} System</h2>
                    {activeTab === 'users' && (
                        <div className="flex gap-4">
                            <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg flex items-center gap-2">
                                <Trash2 size={20}/> HAPUS MASAL
                            </button>
                            <label className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg cursor-pointer flex items-center gap-2">
                                <FileSpreadsheet size={20}/> IMPOR EXCEL
                                <input type="file" className="hidden" accept=".xlsx" onChange={(e) => {
                                    const f = new FormData(); f.append('file', e.target.files[0]);
                                    fetch(`${API_URL}/admin/users/bulk`, {method:'POST', body:f}).then(refreshData);
                                }}/>
                            </label>
                        </div>
                    )}
                </div>

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                    <th className="p-8">Nama Lengkap</th>
                                    <th className="p-8">ID Username</th>
                                    <th className="p-8 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? users.map(u => (
                                    <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-all">
                                        <td className="p-8 font-black text-slate-800">{u.full_name}</td>
                                        <td className="p-8 font-mono text-indigo-600">{u.username}</td>
                                        <td className="p-8 text-right">
                                            <button onClick={() => fetch(`${API_URL}/admin/users/${u.id}`, {method:'DELETE'}).then(refreshData)} className="p-3 text-rose-400 hover:text-rose-600"><Trash2 size={20}/></button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="3" className="p-20 text-center text-slate-400 font-bold italic underline decoration-indigo-500">Database Peserta Kosong...</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid gap-8 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-10 rounded-[3.5rem] shadow-xl border border-slate-100 relative group">
                                <h3 className="text-2xl font-black text-slate-800 mb-8">{p.name} <span className="text-indigo-600 ml-2">[{p.exam_type}]</span></h3>
                                <div className="space-y-4">
                                    {p.exams?.map(e => (
                                        <div key={e.id} className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center group/item transition-all hover:bg-slate-100">
                                            <span className="font-bold text-slate-600">{e.title}</span>
                                            <div className="flex gap-2">
                                                <button onClick={() => setShowManualSoal(e.id)} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-200"><Edit3 size={18}/></button>
                                                <label className="p-3 bg-emerald-100 text-emerald-600 rounded-xl cursor-pointer hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                                    <Upload size={18}/><input type="file" className="hidden" onChange={(x) => {
                                                        const f = new FormData(); f.append('file', x.target.files[0]);
                                                        fetch(`${API_URL}/admin/upload-questions/${e.id}`, { method: 'POST', body: f }).then(() => alert("Soal Berhasil Diupload!"));
                                                    }}/>
                                                </label>
                                                <button className="p-3 bg-slate-200 text-slate-600 rounded-xl"><Eye size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showManualSoal && (
                <div className="fixed inset-0 bg-[#0F172A]/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[4rem] p-12 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button className="absolute top-10 right-10 p-4 bg-slate-100 rounded-full" onClick={() => setShowManualSoal(null)}><X size={32}/></button>
                        <h3 className="text-3xl font-black italic mb-10 text-indigo-600 underline">Professional Question Editor</h3>
                        <div className="space-y-8">
                           <textarea className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] h-48 outline-none focus:border-indigo-500 font-bold text-xl" placeholder="Tulis soal di sini... (Gunakan $...$ untuk rumus)" value={soalData.text} onChange={e => setSoalData({...soalData, text:e.target.value})}/>
                           <div className="grid gap-4">
                                {soalData.options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl">
                                        <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg">{opt.idx}</div>
                                        <input className="flex-1 bg-transparent border-b-2 border-slate-200 outline-none font-bold text-lg focus:border-indigo-500" value={opt.label} onChange={e => {
                                            const newOpts = [...soalData.options]; newOpts[i].label = e.target.value; setSoalData({...soalData, options: newOpts});
                                        }}/>
                                        <input type="radio" name="correct" checked={opt.is_correct} onChange={() => {
                                            const newOpts = soalData.options.map((o, idx) => ({...o, is_correct: idx === i}));
                                            setSoalData({...soalData, options: newOpts});
                                        }} className="w-6 h-6 accent-indigo-600 cursor-pointer"/>
                                    </div>
                                ))}
                           </div>
                           <button onClick={(e) => {
                               e.preventDefault();
                               fetch(`${API_URL}/admin/exams/${showManualSoal}/manual`, {
                                   method: 'POST', headers: {'Content-Type': 'application/json'},
                                   body: JSON.stringify(soalData)
                               }).then(() => { alert("SOAL TERPUBLIKASI!"); setShowManualSoal(null); refreshData(); });
                           }} className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black text-2xl shadow-xl shadow-indigo-200 flex items-center justify-center gap-4 group">
                               <Send className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform"/> PUBLISH TO SYSTEM
                           </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;