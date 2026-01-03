import React, { useState } from 'react';
import { 
    BookOpen, ArrowRight, Play, FileText, Folder, 
    ChevronLeft, Award, User
} from 'lucide-react';
import { SUBJECT_FOLDERS, MOCK_MATERIALS } from './data/mockData';

const StudentDashboard = ({ user, onLogout }) => {
    const [mainView, setMainView] = useState('menu'); 
    
    // State LMS
    const [lmsCategory, setLmsCategory] = useState('UTBK'); 
    const [selectedSubject, setSelectedSubject] = useState(null); 

    // --- VIEW 1: MENU UTAMA (LUXURY STYLE) ---
    if (mainView === 'menu') {
        return (
            <div className="min-h-screen bg-slate-50 font-sans relative flex flex-col">
                {/* Header Mewah */}
                <div className="h-64 bg-gradient-to-r from-blue-900 to-indigo-900 text-white relative overflow-hidden rounded-b-[3rem] shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="max-w-6xl mx-auto p-8 relative z-10 flex justify-between items-start">
                        <div>
                            <div className="text-indigo-300 font-bold tracking-widest text-xs uppercase mb-1">PLATFORM UJIAN DIGITAL</div>
                            <h1 className="text-3xl font-black tracking-tight">CBT PRO EXCELLENCE</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right hidden md:block">
                                <div className="font-bold text-sm">{user.full_name}</div>
                                <div className="text-xs text-indigo-300">Peserta Ujian</div>
                            </div>
                            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-full flex items-center justify-center border border-white/20">
                                <User size={20}/>
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full p-8">
                        <div className="max-w-6xl mx-auto">
                            <h2 className="text-2xl font-bold opacity-90">Selamat Datang, {user.full_name.split(' ')[0]}!</h2>
                            <p className="text-indigo-200 text-sm">Siapkah kamu menaklukkan ujian hari ini?</p>
                        </div>
                    </div>
                </div>

                {/* Card Menu Utama */}
                <div className="max-w-5xl mx-auto w-full px-6 -mt-16 relative z-20 grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
                    
                    {/* CARD LMS */}
                    <div onClick={()=>setMainView('lms')} className="bg-white p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-all cursor-pointer border border-slate-100 group relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition group-hover:bg-blue-100"></div>
                        <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
                            <BookOpen size={28}/>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">LMS & Materi</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Akses modul belajar terstruktur untuk UTBK, CPNS, Kedinasan, dan Ujian Mandiri.
                        </p>
                        <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:gap-4 transition-all">
                            Buka Ruang Belajar <ArrowRight size={18}/>
                        </div>
                    </div>

                    {/* CARD CBT */}
                    <div onClick={()=>alert("Fitur Ujian (Gabungkan dengan kode exam sebelumnya)")} className="bg-white p-8 rounded-3xl shadow-xl hover:-translate-y-2 transition-all cursor-pointer border border-slate-100 group relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-10 -mt-10 transition group-hover:bg-purple-100"></div>
                        <div className="w-14 h-14 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-200">
                            <Award size={28}/>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Arena Ujian (CBT)</h2>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            Simulasi CAT Real-time dengan sistem IRT, Blocking Time, dan Perankingan Nasional.
                        </p>
                        <div className="flex items-center gap-2 text-purple-600 font-bold group-hover:gap-4 transition-all">
                            Mulai Simulasi <ArrowRight size={18}/>
                        </div>
                    </div>

                </div>

                {/* Footer Creator */}
                <div className="mt-auto py-6 text-center text-slate-400 text-sm font-medium">
                    &copy; 2024 CBT Pro Excellence. Created by <span className="text-slate-600 font-bold">Muhamad Fadli Azim</span>.
                    <br/>
                    <button onClick={onLogout} className="mt-2 text-red-400 hover:text-red-500 font-bold text-xs">Logout</button>
                </div>
            </div>
        );
    }

    // --- VIEW 2: LMS (FOLDER SYSTEM) ---
    if (mainView === 'lms') {
        const currentFolders = SUBJECT_FOLDERS[lmsCategory] || [];
        
        const filteredMaterials = MOCK_MATERIALS.filter(m => 
            m.category === lmsCategory && 
            (selectedSubject ? m.subject === selectedSubject.id : true)
        );

        return (
            <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
                {/* Header LMS */}
                <div className="bg-white px-6 py-4 shadow-sm sticky top-0 z-30 border-b border-slate-100">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <button onClick={()=>setMainView('menu')} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronLeft/></button>
                            <div>
                                <h1 className="font-black text-xl text-slate-800">LMS CENTER</h1>
                                <p className="text-xs text-slate-500">Pustaka Materi Digital</p>
                            </div>
                        </div>
                        
                        {/* Kategori Tabs */}
                        <div className="flex overflow-x-auto pb-2 md:pb-0 gap-2 scrollbar-hide">
                            {['UTBK', 'CPNS', 'MANDIRI', 'TOEFL'].map(cat => (
                                <button key={cat} 
                                    onClick={()=>{setLmsCategory(cat); setSelectedSubject(null);}} 
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${lmsCategory===cat ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8">
                    
                    {/* LEVEL 1: GRID FOLDER MAPEL */}
                    {!selectedSubject && (
                        <div className="animate-fade-in">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Kategori: {lmsCategory}</h2>
                                <p className="text-slate-500">Pilih mata pelajaran atau sub-tes untuk melihat materi.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {currentFolders.map(folder => (
                                    <button key={folder.id} onClick={()=>setSelectedSubject(folder)} 
                                        className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition text-left group">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${folder.color}`}>
                                            <Folder size={24}/>
                                        </div>
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-indigo-600 transition">{folder.name}</h3>
                                        <div className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">0 Materi</div>
                                    </button>
                                ))}
                            </div>
                            {currentFolders.length === 0 && <div className="text-center py-20 text-slate-400">Folder belum dikonfigurasi untuk kategori ini.</div>}
                        </div>
                    )}

                    {/* LEVEL 2: LIST MATERI */}
                    {selectedSubject && (
                        <div className="animate-fade-in">
                             <button onClick={()=>setSelectedSubject(null)} className="mb-6 text-sm font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1">
                                <ChevronLeft size={16}/> Kembali ke Folder {lmsCategory}
                             </button>
                             
                             <div className="flex items-center gap-3 mb-6">
                                 <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedSubject.color}`}>
                                     <Folder size={20}/>
                                 </div>
                                 <h2 className="text-2xl font-bold text-slate-800">{selectedSubject.name}</h2>
                             </div>

                             <div className="bg-white rounded-2xl shadow-sm border divide-y">
                                 {filteredMaterials.length > 0 ? filteredMaterials.map(m => (
                                     <div key={m.id} className="p-5 flex items-start gap-4 hover:bg-slate-50 transition cursor-pointer group">
                                         <div className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${m.type==='VIDEO'?'bg-red-100 text-red-600':'bg-orange-100 text-orange-600'}`}>
                                             {m.type==='VIDEO' ? <Play size={18} fill="currentColor"/> : <FileText size={18}/>}
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex gap-2 mb-1">
                                                 <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${m.type==='VIDEO'?'bg-red-50 text-red-600':'bg-orange-50 text-orange-600'}`}>{m.type}</span>
                                             </div>
                                             <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition">{m.title}</h3>
                                         </div>
                                         <button className="px-4 py-2 rounded-lg bg-slate-100 text-slate-600 text-sm font-bold group-hover:bg-slate-900 group-hover:text-white transition">
                                             Buka
                                         </button>
                                     </div>
                                 )) : (
                                     <div className="p-12 text-center">
                                         <div className="text-slate-300 mb-2"><Folder size={48} className="mx-auto"/></div>
                                         <p className="text-slate-400 font-medium">Belum ada materi di folder ini.</p>
                                     </div>
                                 )}
                             </div>
                        </div>
                    )}
                </main>

                <div className="mt-auto py-6 text-center text-slate-400 text-sm font-medium border-t">
                    Created by <span className="text-slate-600 font-bold">Muhamad Fadli Azim</span>
                </div>
            </div>
        );
    }

    return <div>Loading...</div>;
};

export default StudentDashboard;