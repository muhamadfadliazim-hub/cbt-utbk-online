import React, { useState, useEffect, useCallback } from 'react';
import { Users, Database, BookOpen, Trash2, Plus, Edit3, Eye, FileSpreadsheet, Send, X, LogOut } from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    const [materials, setMaterials] = useState([]);
    
    // Modals & Forms
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [showLmsModal, setShowLmsModal] = useState(false);
    const [showManualSoal, setShowManualSoal] = useState(null);

    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'student' });
    const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK' });
    const [newLms, setNewLms] = useState({ title: '', type: 'video', category: 'UTBK', url: '' });
    const [soalData, setSoalData] = useState({ text: '', difficulty: 1.0, explanation: '', options: [
        {idx:'A', label:'', is_correct:true}, {idx:'B', label:'', is_correct:false}, 
        {idx:'C', label:'', is_correct:false}, {idx:'D', label:'', is_correct:false}, {idx:'E', label:'', is_correct:false}
    ]});

    const refresh = useCallback(() => {
        fetch(`${API_URL}/admin/users`).then(r => r.json()).then(d => setUsers(Array.isArray(d) ? d : []));
        fetch(`${API_URL}/admin/periods`).then(r => r.json()).then(d => setPeriods(Array.isArray(d) ? d : []));
        fetch(`${API_URL}/materials`).then(r => r.json()).then(d => setMaterials(Array.isArray(d) ? d : []));
    }, []);

    useEffect(() => { refresh(); }, [activeTab, refresh]);

    // --- HANDLERS ---
    const handleAddUser = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/admin/users`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(newUser) }).then(() => { setShowUserModal(false); refresh(); });
    };

    const handleBulkDelete = () => {
        if (window.confirm("Hapus SEMUA peserta?")) fetch(`${API_URL}/admin/users/bulk-delete`, {method:'POST'}).then(refresh);
    };

    const handleAddPeriod = (e) => {
        e.preventDefault();
        const f = new FormData(); f.append('name', newPeriod.name); f.append('exam_type', newPeriod.exam_type);
        fetch(`${API_URL}/admin/periods`, {method:'POST', body:f}).then(() => { setShowPeriodModal(false); refresh(); });
    };

    const handleAddLms = (e) => {
        e.preventDefault();
        const f = new FormData(); f.append('title', newLms.title); f.append('type', newLms.type); f.append('category', newLms.category); f.append('url', newLms.url);
        fetch(`${API_URL}/materials`, {method:'POST', body:f}).then(() => { setShowLmsModal(false); refresh(); });
    };

    return (
        <div className="min-h-screen bg-slate-50 flex text-slate-900 overflow-hidden font-sans">
            <aside className="w-72 bg-[#0F172A] text-white p-8 flex flex-col shadow-2xl">
                <h2 className="text-3xl font-black mb-12 italic tracking-tighter uppercase text-indigo-400">EduPrime</h2>
                <nav className="space-y-4 flex-1">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab==='users'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'hover:bg-white/5 text-slate-400'}`}><Users/> Database Peserta</button>
                    <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab==='exams'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'hover:bg-white/5 text-slate-400'}`}><Database/> Bank Soal & TO</button>
                    <button onClick={() => setActiveTab('lms')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold transition-all ${activeTab==='lms'?'bg-indigo-600 shadow-lg shadow-indigo-500/50':'hover:bg-white/5 text-slate-400'}`}><BookOpen/> LMS & Materi</button>
                </nav>
                <button onClick={onLogout} className="mt-auto p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-black uppercase flex items-center justify-center gap-2 hover:bg-rose-500 hover:text-white transition-all"><LogOut size={18}/> Logout</button>
            </aside>

            <main className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-5xl font-black capitalize tracking-tight">{activeTab}</h1>
                    <div className="flex gap-4">
                        {activeTab === 'users' && (
                            <>
                                <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2"><Trash2 size={20}/> HAPUS MASAL</button>
                                <label className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl cursor-pointer flex items-center gap-2"><FileSpreadsheet size={20}/> IMPOR EXCEL <input type="file" className="hidden" accept=".xlsx" onChange={(e)=>{const f=new FormData();f.append('file',e.target.files[0]);fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:f}).then(refresh);}}/></label>
                                <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2"><Plus/> TAMBAH MANUAL</button>
                            </>
                        )}
                        {activeTab === 'exams' && <button onClick={()=>setShowPeriodModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2"><Plus/> PAKET BARU</button>}
                        {activeTab === 'lms' && <button onClick={()=>setShowLmsModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2"><Plus/> TAMBAH MATERI</button>}
                    </div>
                </header>

                {activeTab === 'users' && (
                    <div className="bg-white rounded-[3rem] shadow-2xl border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b text-slate-400 text-xs font-black uppercase tracking-widest">
                                <tr><th className="p-8">Nama Lengkap</th><th className="p-8">Username</th><th className="p-8">Role</th><th className="p-8 text-right">Aksi</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b hover:bg-slate-50/50 transition-all font-bold">
                                        <td className="p-8 text-slate-800">{u.full_name}</td>
                                        <td className="p-8 font-mono text-indigo-600">{u.username}</td>
                                        <td className="p-8"><span className={`px-4 py-1 rounded-xl text-[10px] ${u.role==='admin'?'bg-amber-100 text-amber-600':'bg-blue-100 text-blue-600'}`}>{u.role}</span></td>
                                        <td className="p-8 text-right"><button onClick={()=>fetch(`${API_URL}/admin/users/${u.id}`,{method:'DELETE'}).then(refresh)} className="p-3 text-rose-400 hover:text-rose-600"><Trash2 size={20}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'exams' && (
                    <div className="grid gap-8 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-10 rounded-[4rem] shadow-2xl border border-slate-100">
                                <h3 className="text-3xl font-black mb-8">{p.name} <span className="text-indigo-600 ml-2">[{p.exam_type}]</span></h3>
                                <div className="space-y-4">
                                    {p.exams?.map(e => (
                                        <div key={e.id} className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center group transition-all hover:bg-slate-100">
                                            <span className="font-bold text-slate-700 text-lg">{e.title}</span>
                                            <div className="flex gap-2">
                                                <button onClick={()=>setShowManualSoal(e.id)} className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg"><Edit3 size={18}/></button>
                                                <button className="p-3 bg-slate-200 text-slate-600 rounded-xl hover:bg-slate-300"><Eye size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'lms' && (
                    <div className="grid gap-8 md:grid-cols-3">
                        {materials.map(m => (
                            <div key={m.id} className="bg-white p-8 rounded-[3rem] shadow-xl border relative">
                                <h4 className="text-2xl font-black mb-4">{m.title}</h4>
                                <div className="flex justify-between items-center pt-6 border-t">
                                    <button onClick={()=>window.open(m.content_url)} className="text-indigo-600 font-black text-xs">BUKA MATERI</button>
                                    <button onClick={()=>fetch(`${API_URL}/materials/${m.id}`,{method:'DELETE'}).then(refresh)} className="text-rose-400"><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {showUserModal && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <form onSubmit={handleAddUser} className="bg-white p-12 rounded-[4rem] w-full max-w-md shadow-2xl">
                        <h3 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">Anggota Baru</h3>
                        <div className="space-y-4">
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} required/>
                            <select className="w-full p-5 bg-slate-50 border rounded-2xl font-black" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                                <option value="student">STUDENT (PESERTA)</option>
                                <option value="admin">ADMIN (OWNER)</option>
                            </select>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={()=>setShowUserModal(false)} className="flex-1 py-5 bg-slate-100 font-black rounded-2xl uppercase text-xs">Batal</button>
                            <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs shadow-xl shadow-indigo-600/30">Simpan</button>
                        </div>
                    </form>
                </div>
            )}
            
            {showPeriodModal && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <form onSubmit={handleAddPeriod} className="bg-white p-12 rounded-[4rem] w-full max-w-md shadow-2xl">
                        <h3 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">Paket Tryout</h3>
                        <div className="space-y-4">
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="Nama Paket" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name: e.target.value})} required/>
                            <select className="w-full p-5 bg-slate-50 border rounded-2xl font-black" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type: e.target.value})}>
                                <option value="UTBK">UTBK SNBT</option>
                                <option value="CPNS">CPNS BKN</option>
                                <option value="MANDIRI">UJIAN MANDIRI</option>
                            </select>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={()=>setShowPeriodModal(false)} className="flex-1 py-5 bg-slate-100 font-black rounded-2xl uppercase text-xs">Batal</button>
                            <button type="submit" className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs shadow-xl shadow-indigo-600/30">Buat Paket</button>
                        </div>
                    </form>
                </div>
            )}

            {showLmsModal && (
                <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6">
                    <form onSubmit={handleAddLms} className="bg-white p-12 rounded-[4rem] w-full max-w-md shadow-2xl">
                        <h3 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">Tambah Materi</h3>
                        <div className="space-y-4">
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="Judul Materi" value={newLms.title} onChange={e=>setNewLms({...newLms, title: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="Link URL" value={newLms.url} onChange={e=>setNewLms({...newLms, url: e.target.value})} required/>
                            <select className="w-full p-5 bg-slate-50 border rounded-2xl font-black" value={newLms.type} onChange={e=>setNewLms({...newLms, type: e.target.value})}>
                                <option value="video">VIDEO</option>
                                <option value="document">PDF / MODUL</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl uppercase text-xs shadow-xl mt-8">Simpan Materi</button>
                        <button type="button" onClick={()=>setShowLmsModal(false)} className="w-full py-4 bg-slate-100 font-black rounded-2xl uppercase text-xs mt-4">Batal</button>
                    </form>
                </div>
            )}

            {showManualSoal && (
                <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[200] flex items-center justify-center p-6">
                    <div className="bg-white rounded-[5rem] p-16 w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl relative border-4 border-indigo-500/20">
                        <button className="absolute top-12 right-12 p-5 bg-slate-100 rounded-full hover:bg-rose-50 hover:text-rose-500 transition-all" onClick={() => setShowManualSoal(null)}><X size={32}/></button>
                        <h3 className="text-4xl font-black italic mb-12 text-indigo-600">Question Builder</h3>
                        <div className="space-y-10">
                            <textarea className="w-full p-10 bg-slate-50 border-4 border-slate-100 rounded-[3rem] h-64 outline-none focus:border-indigo-500 font-black text-2xl placeholder-slate-300 shadow-inner" placeholder="Tulis soal di sini... Gunakan $ untuk Matematika" value={soalData.text} onChange={e=>setSoalData({...soalData, text:e.target.value})}/>
                            <div className="grid gap-6">
                                {soalData.options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-8 p-8 bg-slate-50 rounded-[2.5rem] border-2 border-transparent hover:border-indigo-500/30 transition-all">
                                        <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center font-black text-3xl shadow-xl">{opt.idx}</div>
                                        <input className="flex-1 bg-transparent outline-none font-black text-xl" placeholder={`Pilihan ${opt.idx}`} value={opt.label} onChange={e=>{const n=[...soalData.options]; n[i].label=e.target.value; setSoalData({...soalData, options:n});}}/>
                                        <input type="radio" name="correct" className="w-10 h-10 accent-emerald-500 cursor-pointer" checked={opt.is_correct} onChange={()=>{const n=soalData.options.map((o,x)=>({...o,is_correct:x===i})); setSoalData({...soalData, options:n});}}/>
                                    </div>
                                ))}
                            </div>
                            <button onClick={(e)=>{e.preventDefault(); fetch(`${API_URL}/admin/exams/${showManualSoal}/manual`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(soalData)}).then(()=>{alert("SOAL TERSIMPAN!"); setShowManualSoal(null); refresh();});}} className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-8 rounded-[3rem] font-black text-3xl shadow-2xl flex items-center justify-center gap-6 group hover:scale-[1.02] active:scale-[0.98] transition-all"><Send className="group-hover:translate-x-2 transition-transform"/> PUBLISH TO SYSTEM</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;