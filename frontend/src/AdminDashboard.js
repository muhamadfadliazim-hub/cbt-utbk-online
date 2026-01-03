import React, { useState, useEffect } from 'react';
import { 
    Users, BookOpen, Database, Plus, Trash2, Eye, 
    FileSpreadsheet, Upload
} from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'student' });
    const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK' });

    const refreshData = () => {
        fetch(`${API_URL}/admin/users`).then(r => r.json()).then(data => setUsers(Array.isArray(data) ? data : []));
        fetch(`${API_URL}/admin/periods`).then(r => r.json()).then(data => setPeriods(Array.isArray(data) ? data : []));
    };

    useEffect(() => { refreshData(); }, [activeTab]);

    const handleBulkDelete = () => {
        if (window.confirm("PERINGATAN: Hapus seluruh peserta? Tindakan ini permanen!")) {
            fetch(`${API_URL}/admin/users/bulk-delete`, { method: 'POST' }).then(() => refreshData());
        }
    };

    const handleBulkUser = (file) => {
        if (!file) return;
        const formData = new FormData(); 
        formData.append('file', file);
        fetch(`${API_URL}/admin/users/bulk`, { method: 'POST', body: formData })
            .then(() => { alert("Impor Berhasil!"); refreshData(); });
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/admin/users`, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(newUser) 
        }).then(() => { setShowUserModal(false); refreshData(); });
    };

    const handleAddPeriod = (e) => {
        e.preventDefault();
        const f = new FormData(); 
        f.append('name', newPeriod.name); 
        f.append('exam_type', newPeriod.exam_type);
        fetch(`${API_URL}/admin/periods`, { method: 'POST', body: f }).then(() => { 
            setShowPeriodModal(false); 
            refreshData(); 
        });
    };

    const handleUploadSoal = (eid, file) => {
        const f = new FormData(); 
        f.append('file', file);
        fetch(`${API_URL}/admin/upload-questions/${eid}`, { method: 'POST', body: f })
            .then(() => alert("Soal Berhasil Diupload!"));
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar Admin */}
            <div className="w-72 bg-[#0F172A] text-white p-8 flex flex-col shadow-2xl">
                <h2 className="text-2xl font-black mb-12 italic tracking-tighter uppercase">EduPrime</h2>
                <nav className="space-y-3 flex-1">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold ${activeTab === 'users' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}><Users size={20}/> Peserta</button>
                    <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold ${activeTab === 'exams' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}><Database size={20}/> Bank Soal</button>
                    <button onClick={() => setActiveTab('lms')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold ${activeTab === 'lms' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}><BookOpen size={20}/> LMS Materi</button>
                </nav>
                <button onClick={onLogout} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-black uppercase text-xs">Logout Session</button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black capitalize tracking-tight">{activeTab} System</h1>
                    <div className="flex gap-4">
                        {activeTab === 'users' && (
                            <>
                                <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-rose-700 transition-all transform active:scale-95"><Trash2 size={22}/> HAPUS MASAL</button>
                                <label className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl cursor-pointer hover:bg-emerald-700 transition-all">
                                    <FileSpreadsheet size={22}/> IMPOR EXCEL 
                                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleBulkUser(e.target.files[0])}/>
                                </label>
                                <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all transform active:scale-95"><Plus size={22}/> TAMBAH MANUAL</button>
                            </>
                        )}
                        {activeTab === 'exams' && (
                            <button onClick={() => setShowPeriodModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:bg-indigo-700 transition-all transform active:scale-95"><Plus size={22}/> BUAT PAKET BARU</button>
                        )}
                    </div>
                </header>

                {/* Database Peserta Table */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <tr><th className="p-8">Nama Lengkap</th><th className="p-8">Username ID</th><th className="p-8">Role</th><th className="p-8 text-right">Aksi</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-all">
                                        <td className="p-8 font-black text-slate-800">{u.full_name}</td>
                                        <td className="p-8 font-mono text-sm text-slate-500">{u.username}</td>
                                        <td className="p-8"><span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase border ${u.role === 'admin' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>{u.role}</span></td>
                                        <td className="p-8 text-right"><button onClick={() => fetch(`${API_URL}/admin/users/${u.id}`, {method:'DELETE'}).then(refreshData)} className="p-3 text-rose-400 hover:text-rose-600 transition-all"><Trash2 size={20}/></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bank Soal Grid */}
                {activeTab === 'exams' && (
                    <div className="grid gap-8 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border border-slate-100 relative group overflow-hidden">
                                <div className="flex justify-between items-center mb-8 relative z-10">
                                    <h3 className="text-2xl font-black text-slate-800">{p.name} <span className="text-indigo-400 ml-2">[{p.exam_type}]</span></h3>
                                    <button onClick={() => fetch(`${API_URL}/admin/periods/${p.id}`, {method:'DELETE'}).then(refreshData)} className="text-slate-300 hover:text-rose-500"><Trash2 size={20}/></button>
                                </div>
                                <div className="space-y-4">
                                    {p.exams && p.exams.map(e => (
                                        <div key={e.id} className="flex justify-between items-center p-6 bg-slate-50 rounded-3xl group/item">
                                            <span className="font-bold text-slate-600">{e.title}</span>
                                            <div className="flex gap-2">
                                                <label className="p-3 bg-emerald-100 text-emerald-600 rounded-xl cursor-pointer hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                                                    <Upload size={18}/><input type="file" className="hidden" onChange={(x) => handleUploadSoal(e.id, x.target.files[0])}/>
                                                </label>
                                                <button className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"><Eye size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showUserModal && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <form onSubmit={handleAddUser} className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black mb-8 text-center text-slate-800 tracking-tight">Daftarkan Anggota Baru</h3>
                        <div className="space-y-4">
                            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold" placeholder="Username ID" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold" type="password" placeholder="Access Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} required/>
                            <select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-black text-slate-700" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                                <option value="student">Student (Peserta)</option>
                                <option value="admin">Administrator (Penuh)</option>
                            </select>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={()=>setShowUserModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">BATAL</button>
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg">SIMPAN</button>
                        </div>
                    </form>
                </div>
            )}

            {showPeriodModal && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <form onSubmit={handleAddPeriod} className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black mb-8 text-center text-slate-800 tracking-tight">Buat Paket Tryout Baru</h3>
                        <div className="space-y-4">
                            <input className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-bold" placeholder="Nama Paket (Contoh: TO Mandiri #1)" value={newPeriod.name} onChange={e=>setNewPeriod({...newPeriod, name: e.target.value})} required/>
                            <select className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-600 font-black text-slate-700" value={newPeriod.exam_type} onChange={e=>setNewPeriod({...newPeriod, exam_type: e.target.value})}>
                                <option value="UTBK">UTBK SNBT</option>
                                <option value="CPNS">CPNS BKN</option>
                                <option value="MANDIRI">UJIAN MANDIRI</option>
                                <option value="TKA">TKA SAINTEK/SOSHUM</option>
                            </select>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={()=>setShowPeriodModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">BATAL</button>
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20">AKTIVASI PAKET</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;