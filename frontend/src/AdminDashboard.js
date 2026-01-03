import React, { useState } from 'react';
import { 
  Upload, Trash2, Plus, Database, 
  Users, Video, Shield, LogOut, Search 
} from 'lucide-react';
import { INITIAL_UNIVERSITY_DATA } from './data/mockData';

const AdminDashboard = ({ onLogout }) => {
    const [view, setView] = useState('ptn'); 
    const [uniData, setUniData] = useState(INITIAL_UNIVERSITY_DATA);
    const [searchTerm, setSearchTerm] = useState('');
    
    // --- FITUR BACA EXCEL (SIMULASI FRONTEND) ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.name.endsWith('.csv')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const rows = event.target.result.split('\n').slice(1);
                const newEntries = rows.map((row, index) => {
                    const cols = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
                    if (cols.length >= 3) return {
                        id: Date.now() + index,
                        uni: cols[0].replace(/"/g, '').trim(),
                        prodi: cols[1].replace(/"/g, '').trim(),
                        grade: parseFloat(cols[2]) || 0
                    };
                    return null;
                }).filter(Boolean);
                setUniData([...uniData, ...newEntries]);
            };
            reader.readAsText(file);
        } else {
            alert(`File Excel "${file.name}" berhasil diunggah! Data akan diproses server.`);
        }
    };

    const filteredData = uniData.filter(item => 
        item.uni.toLowerCase().includes(searchTerm.toLowerCase()) || 
        item.prodi.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
            {/* SIDEBAR PREMIUM */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col fixed h-full z-10 shadow-2xl">
                <div className="p-8">
                    <div className="font-black text-2xl tracking-tighter flex items-center gap-2 text-indigo-400">
                        <Shield fill="currentColor"/> CBT PRO
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1 tracking-widest">ADMINISTRATOR PANEL</div>
                </div>
                
                <nav className="px-4 space-y-2 flex-1">
                    <button onClick={()=>setView('ptn')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${view==='ptn'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50':'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <Database size={20}/> Data Jurusan (PTN)
                    </button>
                    <button onClick={()=>setView('lms')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${view==='lms'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50':'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <Video size={20}/> Materi LMS
                    </button>
                    <button onClick={()=>setView('users')} className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-bold transition-all ${view==='users'?'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50':'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                        <Users size={20}/> Data Peserta
                    </button>
                </nav>

                <div className="p-6 border-t border-slate-800">
                    <div className="text-xs text-slate-500 font-medium mb-4 text-center">
                        Created by<br/> <span className="text-white font-bold">Muhamad Fadli Azim</span>
                    </div>
                    <button onClick={onLogout} className="w-full bg-red-500/10 text-red-500 hover:bg-red-600 hover:text-white py-3 rounded-xl font-bold transition flex items-center justify-center gap-2">
                        <LogOut size={18}/> Logout
                    </button>
                </div>
            </aside>

            {/* CONTENT */}
            <main className="ml-72 flex-1 p-10 bg-slate-50">
                {view === 'ptn' && (
                    <div className="max-w-5xl mx-auto animate-fade-in">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-slate-900">Database Passing Grade</h1>
                                <p className="text-slate-500 mt-1">Kelola data target jurusan untuk rasionalisasi siswa.</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6 mb-8">
                             {/* Upload Excel Card */}
                             <div className="bg-white p-6 rounded-2xl border border-dashed border-indigo-300 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition group relative">
                                <input type="file" accept=".csv, .xlsx" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition">
                                    <Upload size={24}/>
                                </div>
                                <h3 className="font-bold text-slate-800">Upload Excel / CSV</h3>
                                <p className="text-xs text-slate-500 mt-1">Support file .xlsx asli</p>
                             </div>
                             
                             <div className="col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center">
                                <div className="flex gap-4">
                                    <input placeholder="Nama Universitas" className="flex-1 p-3 bg-slate-50 border rounded-xl font-bold"/>
                                    <input placeholder="Prodi" className="flex-1 p-3 bg-slate-50 border rounded-xl"/>
                                    <input placeholder="Grade" type="number" className="w-24 p-3 bg-slate-50 border rounded-xl"/>
                                    <button className="bg-slate-900 text-white p-3 rounded-xl font-bold"><Plus/></button>
                                </div>
                                <p className="text-xs text-slate-400 mt-3 ml-1">*Input manual jika data excel tidak tersedia</p>
                             </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                            <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                                <div className="font-bold text-slate-600">{uniData.length} Data Tersimpan</div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                                    <input type="text" placeholder="Cari Jurusan..." className="pl-10 pr-4 py-2 border rounded-full text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none" value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}/>
                                </div>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="sticky top-0 bg-white shadow-sm z-10">
                                        <tr className="text-xs font-black text-slate-400 uppercase tracking-wider">
                                            <th className="p-5 bg-white">Universitas</th>
                                            <th className="p-5 bg-white">Program Studi</th>
                                            <th className="p-5 bg-white">Passing Grade</th>
                                            <th className="p-5 bg-white text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredData.map((item) => (
                                            <tr key={item.id} className="hover:bg-slate-50 transition">
                                                <td className="p-5 font-bold text-slate-800">{item.uni}</td>
                                                <td className="p-5 text-sm font-medium text-slate-600">{item.prodi}</td>
                                                <td className="p-5"><span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg font-bold text-sm">{item.grade}</span></td>
                                                <td className="p-5 text-right"><button className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default AdminDashboard;