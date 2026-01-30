import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, Users, LogOut, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Clock, Search, X, Filter, LayoutDashboard, BarChart3, Edit3, Save, FileText, School, Target, Settings, RefreshCcw, Eye, EyeOff, Lock, Unlock, RotateCcw } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';

const AdminDashboard = ({ onLogout, apiUrl }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]); // Default ARRAY KOSONG
  const [loading, setLoading] = useState(false);

  // ... (State lain biarkan saja, yang penting useEffect di bawah)

  // FETCH DATA PERIODS
  const fetchPeriods = useCallback(() => {
    fetch(`${apiUrl}/admin/periods`)
      .then(r => r.json())
      .then(data => {
          // SAFE CHECK
          setPeriods(Array.isArray(data) ? data : []);
      })
      .catch(e => console.error(e));
  }, [apiUrl]);

  // FETCH RECAP (INI YANG SERING BIKIN BLANK)
  const fetchRecap = useCallback(() => {
    // Kita gunakan endpoint download excel sebagai pancingan data, 
    // atau buat endpoint view json kalau ada. 
    // TAPI untuk amannya, kita fetch users dulu, lalu hitung manual atau via endpoint khusus.
    // DISINI SAYA PAKAI DATA USERS BIASA SEBAGAI GANTINYA JIKA REKAP JSON BELUM ADA
    // AGAR TIDAK BLANK.
    fetch(`${apiUrl}/admin/users`)
      .then(r => r.json())
      .then(data => {
          if(Array.isArray(data)) {
              // Transform data user ke format rekap sederhana untuk display
              const simpleRecap = data.map(u => ({
                  username: u.username,
                  full_name: u.full_name,
                  school: u.school,
                  PU: 0, PPU: 0, PBM: 0, PK: 0, LBI: 0, LBE: 0, PM: 0,
                  average: 0,
                  status: "Belum Ujian"
              }));
              setRecap(simpleRecap);
          } else {
              setRecap([]);
          }
      })
      .catch(e => setRecap([]));
  }, [apiUrl]);

  useEffect(() => {
    fetchPeriods();
    if(tab === 'recap') fetchRecap();
    if(tab === 'users') fetch(`${apiUrl}/admin/users`).then(r=>r.json()).then(d=>setUsers(Array.isArray(d)?d:[])).catch(()=>setUsers([]));
  }, [tab, apiUrl, fetchPeriods, fetchRecap]);

  // ... (SISANYA KODE RENDER TABEL, PASTIKAN MAP DI-CEK)

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      {/* SIDEBAR ... (Sama seperti sebelumnya) */}
      <aside className="w-64 bg-[#0f172a] text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2"><LayoutDashboard/> Admin Panel</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setTab('periods')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'periods' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Clock size={20}/> Manajemen Ujian</button>
            <button onClick={() => setTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Users size={20}/> Data Siswa</button>
            <button onClick={() => setTab('recap')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${tab === 'recap' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><BarChart3 size={20}/> Rekap Nilai</button>
        </nav>
        <div className="p-4 border-t border-slate-700">
            <button onClick={onLogout} className="w-full flex items-center gap-2 justify-center px-4 py-3 rounded-xl bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition"><LogOut size={18}/> Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {/* KONTEN UTAMA */}
        
        {/* TAB REKAP NILAI (YANG TADI ERROR) */}
        {tab === 'recap' && (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-800">Rekapitulasi Nilai</h1>
                    <div className="flex gap-2">
                        <a href={`${apiUrl}/admin/recap/download`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"><FileText size={18}/> Excel</a>
                        <a href={`${apiUrl}/admin/recap/download-pdf`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"><FileText size={18}/> PDF</a>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 text-left">Nama Siswa</th>
                                    <th className="p-4 text-left">Sekolah</th>
                                    <th className="p-4 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {/* PENGAMAN: CEK APAKAH ARRAY */}
                                {Array.isArray(recap) && recap.length > 0 ? (
                                    recap.map((r, i) => (
                                        <tr key={i} className="hover:bg-slate-50">
                                            <td className="p-4 font-medium">{r.full_name}<br/><span className="text-xs text-gray-400">{r.username}</span></td>
                                            <td className="p-4">{r.school || "-"}</td>
                                            <td className="p-4 text-center">
                                                <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">Cek di Excel/PDF</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="p-8 text-center text-slate-400">Belum ada data siswa/ujian.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )}

        {/* ... (TAB LAIN PERIODS & USERS BIARKAN SEPERTI SEBELUMNYA ATAU GUNAKAN KODE LAMA) */}
        {/* UNTUK MENYINGKAT, SAYA HANYA TULIS BAGIAN REKAP YANG KRUSIAL */}
        {/* PASTIKAN SAAT COPY PASTE, BAGIAN PERIODS DAN USERS TETAP ADA */}
        {/* JIKA BAPAK BUTUH FILE FULL ADMIN DASHBOARD YANG LENGKAP DENGAN TAB LAIN, KATAKAN SAJA */}
      </main>
    </div>
  );
};

export default AdminDashboard;