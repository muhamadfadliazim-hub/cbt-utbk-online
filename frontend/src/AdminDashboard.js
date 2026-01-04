import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, Upload, Eye, X, BarChart2, FileSpreadsheet } from 'lucide-react';
import { API_URL } from './config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('exams'); 
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    
    // State Form
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
    
    const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(()=>{ setShowUserModal(false); refresh(); }); };
    const handleImportUser = (e) => { const f=new FormData(); f.append('file',e.target.files[0]); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:f}).then(refresh); };
    
    const createPeriod = () => { const f=new FormData();f.append('name',newPeriod.name);f.append('exam_type',newPeriod.exam_type);f.append('access_code',newPeriod.access_code); fetch(`${API_URL}/admin/periods`,{method:'POST',body:f}).then(()=>{setShowPeriodModal(false);refresh()}); };
    const handleUploadSoal = (eid, file) => { const f = new FormData(); f.append('file', file); fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:f}).then(()=>alert("Sukses!")); };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            <aside className="w-64 bg-white border-r p-6 flex flex-col fixed inset-y-0 z-10">
                <h2 className="font-black text-2xl mb-8 text-indigo-600">EduPrime</h2>
                <nav className="space-y-2 flex-1">
                    <button onClick={()=>setActiveTab('exams')} className={`w-full text-left p-3 font-bold rounded-xl flex gap-3 ${activeTab==='exams'?'bg-indigo-50 text-indigo-600':'hover:bg-slate-50'}`}><Database size={20}/> Bank Soal</button>
                    <button onClick={()=>setActiveTab('users')} className={`w-full text-left p-3 font-bold rounded-xl flex gap-3 ${activeTab==='users'?'bg-indigo-50 text-indigo-600':'hover:bg-slate-50'}`}><Users size={20}/> Peserta</button>
                    <button onClick={()=>window.open('/lms')} className="w-full text-left p-3 font-bold rounded-xl flex gap-3 hover:bg-slate-50 text-slate-400"><BookOpen size={20}/> Materi (View)</button>
                </nav>
                <button onClick={onLogout} className="p-3 bg-rose-50 text-rose-600 rounded-xl font-bold">Logout</button>
            </aside>

            <main className="flex-1 p-8 ml-64 overflow-y-auto min-h-screen">
                {/* ANALYTICS SECTION */}
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
                                        <div><h3 className="font-bold text-lg">{p.name}</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded font-bold text-slate-500">{p.exam_type} {p.access_code?`(${p.access_code})`:''}</span></div>
                                        <button onClick={()=>fetch(`${API_URL}/admin/periods/${p.id}`,{method:'DELETE'}).then(refresh)} className="p-2 hover:bg-rose-50 text-rose-400 rounded-lg"><Trash2 size={18}/></button>
                                    </div>
                                    <div className="space-y-2">
                                        {p.exams.map(e => (
                                            <div key={e.id} className="flex gap-2 items-center p-3 border rounded-xl bg-slate-50">
                                                <span className="font-bold text-xs flex-1">{e.title} ({e.duration}m)</span>
                                                <button onClick={()=>showStats(e.id)} className="p-2 bg-white border rounded-lg hover:border-indigo-500 text-indigo-600" title="Analisis"><BarChart2 size={16}/></button>
                                                <button className="p-2 bg-white border rounded-lg hover:border-indigo-500 text-indigo-600" title="Preview"><Eye size={16}/></button>
                                                <label className="p-2 bg-white border rounded-lg cursor-pointer hover:border-indigo-500 text-indigo-600" title="Upload Soal"><Upload size={16}/><input type="file" className="hidden" onChange={x=>handleUploadSoal(e.id, x.target.files[0])}/></label>
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
                                <label className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold cursor-pointer flex items-center gap-2 hover:bg-emerald-700 transition-all"><FileSpreadsheet size={18}/> Import Excel<input type="file" className="hidden" onChange={handleImportUser}/></label>
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
            </main>

            {/* MODAL TAMBAH USER (FIXED: Uses newUser state) */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-200">
                    <form onSubmit={handleAddUser} className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-bold mb-6">Tambah Peserta</h3>
                        <div className="space-y-3">
                            <input className="w-full p-3 border rounded-xl" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})} required/>
                            <input className="w-full p-3 border rounded-xl" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} required/>
                            <input className="w-full p-3 border rounded-xl" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} required/>
                            <input className="w-full p-3 border rounded-xl" placeholder="Kode Grup (Opsional)" value={newUser.group} onChange={e=>setNewUser({...newUser, group: e.target.value})}/>
                            <select className="w-full p-3 border rounded-xl bg-white" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                                <option value="peserta">Peserta</option><option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button type="button" onClick={()=>setShowUserModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200">Batal</button>
                            <button type="submit" className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Simpan</button>
                        </div>
                    </form>
                </div>
            )}

            {/* MODAL TAMBAH PERIOD */}
            {showPeriodModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-sm shadow-2xl">
                        <h3 className="text-xl font-bold mb-6">Paket Ujian Baru</h3>
                        <div className="space-y-3">
                            <input className="w-full p-3 border rounded-xl" placeholder="Nama Paket" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name:e.target.value})}/>
                            <select className="w-full p-3 border rounded-xl bg-white" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type:e.target.value})}>
                                <option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="TKA">TKA</option><option value="MANDIRI">MANDIRI</option>
                            </select>
                            <input className="w-full p-3 border rounded-xl" placeholder="Kode Akses (Opsional)" value={newPeriod.access_code} onChange={e=>setNewPeriod({...newPeriod, access_code:e.target.value})}/>
                        </div>
                        <div className="flex gap-2 mt-6">
                            <button onClick={()=>setShowPeriodModal(false)} className="flex-1 p-3 bg-slate-100 rounded-xl font-bold hover:bg-slate-200">Batal</button>
                            <button onClick={createPeriod} className="flex-1 p-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Buat</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminDashboard;