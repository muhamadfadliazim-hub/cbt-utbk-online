import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, Upload, Eye, X, BarChart2 } from 'lucide-react';
import { API_URL } from './config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('exams'); 
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [newUser, setNewUser] = useState({username:'', full_name:'', password:'', role:'peserta', group:'GENERAL'});
    const [newPeriod, setNewPeriod] = useState({name:'', exam_type:'UTBK', access_code:''});
    
    // Modal States
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    
    const refresh = useCallback(() => {
        fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(setUsers);
        fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(setPeriods);
    }, []);
    useEffect(() => { refresh(); }, [refresh]);

    const showStats = (eid) => { fetch(`${API_URL}/admin/analytics/${eid}`).then(r=>r.json()).then(setAnalytics); };
    const handleAddUser = (e) => { e.preventDefault(); const f=new FormData(); f.append('file',e.target.files[0]); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:f}).then(refresh); };
    const createPeriod = () => { const f=new FormData();f.append('name',newPeriod.name);f.append('exam_type',newPeriod.exam_type);f.append('access_code',newPeriod.access_code); fetch(`${API_URL}/admin/periods`,{method:'POST',body:f}).then(()=>{setShowPeriodModal(false);refresh()}); };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <aside className="w-64 bg-white border-r p-6 flex flex-col">
                <h2 className="font-black text-2xl mb-8 text-indigo-600">EduPrime V50</h2>
                <nav className="space-y-2 flex-1">
                    <button onClick={()=>setActiveTab('exams')} className={`w-full text-left p-3 font-bold rounded-xl flex gap-3 ${activeTab==='exams'?'bg-indigo-50 text-indigo-600':''}`}><Database/> Bank Soal</button>
                    <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-3 font-bold rounded-xl flex gap-3 ${activeTab==='users'?'bg-indigo-50 text-indigo-600':''}`}><Users/> Peserta</button>
                </nav>
                <button onClick={onLogout} className="p-3 bg-rose-50 text-rose-600 rounded-xl font-bold">Logout</button>
            </aside>

            <main className="flex-1 p-8 overflow-y-auto">
                {analytics && (
                    <div className="mb-8 p-6 bg-white rounded-[2rem] shadow-xl border border-slate-100 relative">
                        <button onClick={()=>setAnalytics(null)} className="absolute top-6 right-6"><X/></button>
                        <h3 className="font-bold text-xl mb-4">Analisis Hasil Ujian</h3>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <h4 className="font-bold text-sm text-slate-500 mb-2">Peringkat Tertinggi</h4>
                                {analytics.leaderboard.map((l,i)=>(<div key={i} className="flex justify-between p-2 border-b"><span className="font-bold">#{i+1} {l.name}</span><span>{l.score}</span></div>))}
                            </div>
                            <div className="h-64">
                                <h4 className="font-bold text-sm text-slate-500 mb-2">Statistik Soal (% Benar)</h4>
                                <ResponsiveContainer><BarChart data={analytics.stats}><XAxis dataKey="no"/><Tooltip/><Bar dataKey="pct" fill="#6366f1" radius={[4,4,0,0]}/></BarChart></ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <>
                        <div className="flex justify-between mb-6">
                            <h1 className="text-3xl font-black">Bank Soal</h1>
                            <button onClick={()=>setShowPeriodModal(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2"><Plus/> Buat Paket</button>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {periods.map(p => (
                                <div key={p.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-center mb-4">
                                        <div><h3 className="font-bold text-lg">{p.name}</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded">{p.exam_type} {p.access_code?`(${p.access_code})`:''}</span></div>
                                        <button onClick={()=>fetch(`${API_URL}/admin/periods/${p.id}`,{method:'DELETE'}).then(refresh)}><Trash2 className="text-rose-400"/></button>
                                    </div>
                                    <div className="space-y-2">
                                        {p.exams.map(e => (
                                            <div key={e.id} className="flex gap-2 items-center p-2 border rounded-lg bg-slate-50">
                                                <span className="font-bold text-xs flex-1">{e.title}</span>
                                                <button onClick={()=>showStats(e.id)} className="p-1 bg-white border rounded"><BarChart2 size={14}/></button>
                                                <label className="p-1 bg-white border rounded cursor-pointer"><Upload size={14}/><input type="file" className="hidden" onChange={x=>{const f=new FormData();f.append('file',x.target.files[0]);fetch(`${API_URL}/admin/upload-questions/${e.id}`,{method:'POST',body:f}).then(()=>alert("Uploaded!"))}}/></label>
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
                            <label className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer"><Upload className="inline mr-2"/> Import Excel<input type="file" className="hidden" onChange={handleAddUser}/></label>
                        </div>
                        <div className="bg-white rounded-[2rem] shadow-sm border overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 font-bold text-slate-500"><tr><th className="p-4">Nama</th><th className="p-4">Username</th><th className="p-4">Kode Grup</th></tr></thead>
                                <tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-4 font-bold">{u.full_name}</td><td className="p-4">{u.username}</td><td className="p-4"><span className="bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-bold text-xs">{u.group_code}</span></td></tr>))}</tbody>
                            </table>
                        </div>
                    </>
                )}
            </main>

            {showPeriodModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm">
                        <h3 className="text-xl font-bold mb-4">Paket Baru</h3>
                        <input className="w-full mb-3 p-3 border rounded-xl" placeholder="Nama Paket" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name:e.target.value})}/>
                        <select className="w-full mb-3 p-3 border rounded-xl" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type:e.target.value})}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option><option value="MANDIRI">MANDIRI</option></select>
                        <input className="w-full mb-3 p-3 border rounded-xl" placeholder="Kode Akses (Opsional, misal: SMAN1)" value={newPeriod.access_code} onChange={e=>setNewPeriod({...newPeriod, access_code:e.target.value})}/>
                        <div className="flex gap-2"><button onClick={()=>setShowPeriodModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold">Batal</button><button onClick={createPeriod} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold">Buat</button></div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminDashboard;