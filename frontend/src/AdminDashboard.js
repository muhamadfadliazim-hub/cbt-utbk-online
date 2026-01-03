import React, { useState } from 'react';
import { 
    Users, BookOpen, Database, Plus, Trash2, Eye, X, 
    CheckCircle, FileSpreadsheet, Upload
} from 'lucide-react';
import { API_URL } from './config';

const AdminDashboard = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [periods, setPeriods] = useState([]);
    
    // Form States
    const [showUserModal, setShowUserModal] = useState(false);
    const [showPeriodModal, setShowPeriodModal] = useState(false);
    const [previewExam, setPreviewExam] = useState(null);

    const [newUser, setNewUser] = useState({ username: '', full_name: '', password: '', role: 'student' });
    const [newPeriod, setNewPeriod] = useState({ name: '', exam_type: 'UTBK' });

    const refreshData = () => {
        fetch(`${API_URL}/admin/users`)
            .then(r => r.json())
            .then(data => setUsers(Array.isArray(data) ? data : []))
            .catch(() => setUsers([]));

        fetch(`${API_URL}/admin/periods`)
            .then(r => r.json())
            .then(data => setPeriods(Array.isArray(data) ? data : []))
            .catch(() => setPeriods([]));
    };

    // Trigger refresh saat tab berubah
    React.useEffect(() => {
        refreshData();
    }, [activeTab]);

    const handleBulkDelete = () => {
        if (window.confirm("Hapus seluruh peserta? Tindakan ini tidak bisa dibatalkan!")) {
            fetch(`${API_URL}/admin/users/bulk-delete`, { method: 'POST' }).then(() => refreshData());
        }
    };

    const handleBulkUser = (file) => {
        const formData = new FormData();
        formData.append('file', file);
        fetch(`${API_URL}/admin/users/bulk`, { method: 'POST', body: formData })
            .then(() => { alert("Peserta Berhasil Diimpor!"); refreshData(); });
    };

    const handleAddUser = (e) => {
        e.preventDefault();
        fetch(`${API_URL}/admin/users`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newUser)
        }).then(() => { setShowUserModal(false); refreshData(); });
    };

    const handleAddPeriod = (e) => {
        e.preventDefault();
        const f = new FormData();
        f.append('name', newPeriod.name);
        f.append('exam_type', newPeriod.exam_type);
        fetch(`${API_URL}/admin/periods`, { method: 'POST', body: f }).then(() => {
            setShowPeriodModal(false); refreshData();
        });
    };

    const handleUploadSoal = (eid, file) => {
        const f = new FormData();
        f.append('file', file);
        fetch(`${API_URL}/admin/upload-questions/${eid}`, { method: 'POST', body: f }).then(() => alert("Upload Berhasil!"));
    };

    const handlePreview = (eid) => {
        fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r => r.json()).then(setPreviewExam);
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar Admin */}
            <div className="w-72 bg-[#0F172A] text-white p-8 flex flex-col shadow-2xl">
                <h2 className="text-2xl font-black mb-12 italic tracking-tighter uppercase">EduPrime</h2>
                <nav className="space-y-3 flex-1">
                    <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-4 p-4 rounded-2xl font-bold ${activeTab === 'users' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Users size={20}/> Database Peserta
                    </button>
                    <button onClick={() => setActiveTab('exams')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'exams' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <Database size={20}/> Bank Soal & TO
                    </button>
                    <button onClick={() => setActiveTab('lms')} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold ${activeTab === 'lms' ? 'bg-indigo-600 shadow-lg' : 'hover:bg-white/5 text-slate-400'}`}>
                        <BookOpen size={20}/> LMS & Materi
                    </button>
                </nav>
                <button onClick={onLogout} className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl border border-rose-500/20 font-black">LOGOUT</button>
            </div>

            {/* Main Area */}
            <div className="flex-1 p-12 overflow-y-auto">
                <header className="flex justify-between items-center mb-12">
                    <h1 className="text-4xl font-black capitalize tracking-tight">{activeTab} System</h1>
                    <div className="flex gap-4">
                        {activeTab === 'users' && (
                            <>
                                <button onClick={handleBulkDelete} className="bg-rose-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl flex items-center gap-2"><Trash2 size={18}/> HAPUS MASAL</button>
                                <label className="bg-emerald-600 text-white px-6 py-4 rounded-2xl font-black shadow-xl cursor-pointer flex items-center gap-2">
                                    <FileSpreadsheet size={18}/> IMPOR EXCEL
                                    <input type="file" className="hidden" accept=".xlsx, .xls" onChange={(e) => handleBulkUser(e.target.files[0])}/>
                                </label>
                                <button onClick={() => setShowUserModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl"><Plus size={18}/> TAMBAH MANUAL</button>
                            </>
                        )}
                        {activeTab === 'exams' && (
                            <button onClick={() => setShowPeriodModal(true)} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black shadow-xl"><Plus size={18}/> BUAT PAKET BARU</button>
                        )}
                    </div>
                </header>

                {/* Database Peserta Table */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-[3rem] shadow-2xl border overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b text-slate-400 text-[10px] font-black uppercase">
                                <tr><th className="p-8">Nama Lengkap</th><th className="p-8">Username ID</th><th className="p-8">Role</th><th className="p-8 text-right">Aksi</th></tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u.id} className="border-b hover:bg-slate-50/50">
                                        <td className="p-8 font-black">{u.full_name}</td>
                                        <td className="p-8 font-mono">{u.username}</td>
                                        <td className="p-8"><span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">{u.role}</span></td>
                                        <td className="p-8 text-right">
                                            <button onClick={() => fetch(`${API_URL}/admin/users/${u.id}`, {method:'DELETE'}).then(refreshData)} className="p-3 text-rose-400 hover:text-rose-600 transition-all"><Trash2 size={20}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Bank Soal Tab */}
                {activeTab === 'exams' && (
                    <div className="grid gap-8 md:grid-cols-2">
                        {periods.map(p => (
                            <div key={p.id} className="bg-white p-10 rounded-[3.5rem] shadow-2xl border">
                                <div className="flex justify-between items-center mb-8">
                                    <h3 className="text-2xl font-black">{p.name} <span className="text-indigo-600 ml-2">[{p.exam_type}]</span></h3>
                                    <button onClick={() => fetch(`${API_URL}/admin/periods/${p.id}`, {method:'DELETE'}).then(refreshData)} className="text-rose-400"><Trash2 size={20}/></button>
                                </div>
                                <div className="space-y-4">
                                    {p.exams && p.exams.map(e => (
                                        <div key={e.id} className="p-6 bg-slate-50 rounded-3xl flex justify-between items-center group">
                                            <span className="font-bold">{e.title}</span>
                                            <div className="flex gap-2">
                                                <label className="p-3 bg-emerald-100 text-emerald-600 rounded-xl cursor-pointer hover:bg-emerald-600 hover:text-white transition-all">
                                                    <Upload size={18}/><input type="file" className="hidden" onChange={(x) => handleUploadSoal(e.id, x.target.files[0])}/>
                                                </label>
                                                <button onClick={() => handlePreview(e.id)} className="p-3 bg-indigo-100 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all"><Eye size={18}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modals Section */}
            {showUserModal && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <form onSubmit={handleAddUser} className="bg-white rounded-[3.5rem] p-12 w-full max-w-md">
                        <h3 className="text-2xl font-black mb-8 text-center uppercase tracking-tight">Tambah Anggota</h3>
                        <div className="space-y-4">
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="Nama Lengkap" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username: e.target.value})} required/>
                            <input className="w-full p-5 bg-slate-50 border rounded-2xl font-bold" type="password" placeholder="Password" value={newUser.password} onChange={e=>setNewUser({...newUser, password: e.target.value})} required/>
                            <select className="w-full p-5 bg-slate-50 border rounded-2xl font-black" value={newUser.role} onChange={e=>setNewUser({...newUser, role: e.target.value})}>
                                <option value="student">STUDENT (PESERTA)</option>
                                <option value="admin">ADMIN (STAFF)</option>
                            </select>
                        </div>
                        <div className="flex gap-4 mt-10">
                            <button type="button" onClick={()=>setShowUserModal(false)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black">BATAL</button>
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black">SIMPAN</button>
                        </div>
                    </form>
                </div>
            )}

            {showPeriodModal && (
                <div className="fixed inset-0 bg-[#0F172A]/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
                    <form onSubmit={handleAddPeriod} className="bg-white rounded-[3.5rem] p-12 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black mb-8 text-center text-slate-800 tracking-tight text-uppercase">Buat Paket Tryout</h3>
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
                            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-600/20 text-xs">AKTIVASI PAKET</button>
                        </div>
                    </form>
                </div>
            )}

            {previewExam && (
                <div className="fixed inset-0 bg-white z-[100] overflow-y-auto p-12 animate-in slide-in-from-bottom-10">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-12 border-b pb-8">
                            <h2 className="text-4xl font-black italic">{previewExam.title} - Preview</h2>
                            <button onClick={() => setPreviewExam(null)} className="p-5 bg-slate-100 rounded-full hover:bg-rose-50"><X size={32}/></button>
                        </div>
                        <div className="space-y-8">
                            {previewExam.questions && previewExam.questions.map((q, i) => (
                                <div key={i} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl relative">
                                    <div className="flex justify-between mb-6">
                                        <span className="bg-indigo-900 text-white px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">Soal {i+1}</span>
                                        <button onClick={() => fetch(`${API_URL}/admin/questions/${q.id}`, {method:'DELETE'}).then(() => handlePreview(previewExam.id))} className="text-rose-500"><Trash2 size={20}/></button>
                                    </div>
                                    <p className="text-2xl font-bold mb-10 text-slate-800 italic">"{q.text}"</p>
                                    <div className="grid gap-4">
                                        {q.options && q.options.map((o, idx) => (
                                            <div key={idx} className={`p-6 rounded-2xl border-2 flex items-center justify-between ${o.is_correct ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-black' : 'bg-slate-50 text-slate-400 opacity-60'}`}>
                                                <span className="text-lg">{o.option_index}. {o.label}</span>
                                                {o.is_correct && <CheckCircle size={24}/>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;