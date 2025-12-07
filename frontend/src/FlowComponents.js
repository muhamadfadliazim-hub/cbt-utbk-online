import React, { useState, useEffect } from 'react';
import { Building2, ArrowRight, FileText, LogOut } from 'lucide-react'; // Tambah LogOut
import { API_URL } from './config';

// --- 1. KOMPONEN PILIH JURUSAN ---
// Tambahkan props 'onLogout' di sini
export const MajorSelection = ({ onNext, onLogout }) => {
  const [majors, setMajors] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [univ1, setUniv1] = useState('');
  const [majorId1, setMajorId1] = useState('');
  const [univ2, setUniv2] = useState('');
  const [majorId2, setMajorId2] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/majors`)
      .then(res => res.json())
      .then(data => {
        setMajors(data);
        const univs = [...new Set(data.map(m => m.university))].sort();
        setUniversities(univs);
      })
      .catch(() => alert("Gagal mengambil data jurusan."));
  }, []);

  const getMajorsByUniv = (univName) => majors.filter(m => m.university === univName).sort((a,b) => a.name.localeCompare(b.name));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!majorId1) { alert("Pilihan 1 Wajib!"); return; }
    const c1 = majors.find(m => m.id === parseInt(majorId1));
    const c2 = majors.find(m => m.id === parseInt(majorId2));
    onNext({
      choice1_id: parseInt(majorId1), choice2_id: majorId2 ? parseInt(majorId2) : null,
      display1: c1 ? `${c1.university} - ${c1.name}` : '', pg1: c1 ? c1.passing_grade : '',
      display2: c2 ? `${c2.university} - ${c2.name}` : '-', pg2: c2 ? c2.passing_grade : ''
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full relative">
        
        {/* HEADER DENGAN TOMBOL LOGOUT */}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
            <div className="flex items-center gap-3">
                <Building2 className="text-blue-600" size={32} />
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Pilih Jurusan & PTN</h2>
                    <p className="text-sm text-gray-500">Tentukan target masa depanmu</p>
                </div>
            </div>
            
            {/* TOMBOL LOGOUT */}
            <button 
                onClick={onLogout} 
                className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-2 rounded-lg hover:bg-red-100 transition"
            >
                <LogOut size={16}/> Keluar
            </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="font-bold text-blue-800 mb-3 text-sm">Pilihan 1 (Prioritas)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="w-full p-2 border rounded text-sm" value={univ1} onChange={(e) => { setUniv1(e.target.value); setMajorId1(''); }}><option value="">-- Pilih PTN --</option>{universities.map((univ) => <option key={univ} value={univ}>{univ}</option>)}</select>
              <select className="w-full p-2 border rounded text-sm" value={majorId1} onChange={(e) => setMajorId1(e.target.value)} disabled={!univ1}><option value="">-- Pilih Jurusan --</option>{getMajorsByUniv(univ1).map((m) => <option key={m.id} value={m.id}>{m.name} (PG: {m.passing_grade})</option>)}</select>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-bold text-gray-600 mb-3 text-sm">Pilihan 2 (Opsional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="w-full p-2 border rounded text-sm" value={univ2} onChange={(e) => { setUniv2(e.target.value); setMajorId2(''); }}><option value="">-- Pilih PTN --</option>{universities.map((univ) => <option key={univ} value={univ}>{univ}</option>)}</select>
              <select className="w-full p-2 border rounded text-sm" value={majorId2} onChange={(e) => setMajorId2(e.target.value)} disabled={!univ2}><option value="">-- Pilih Jurusan --</option>{getMajorsByUniv(univ2).map((m) => <option key={m.id} value={m.id}>{m.name} (PG: {m.passing_grade})</option>)}</select>
            </div>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg">Simpan Pilihan & Lanjutkan</button>
        </form>
      </div>
    </div>
  );
};

// --- 2. KOMPONEN KONFIRMASI (TATA TERTIB) ---
export const Confirmation = ({ userData, onStart, onBack }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-3xl w-full border-t-8 border-indigo-600">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2 flex items-center gap-2"><FileText className="text-indigo-600" /> TATA TERTIB & TARGET</h2>
        <p className="text-gray-500 mb-6 text-sm">Mohon periksa pilihan jurusan dan baca aturan ujian.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="bg-gray-50 p-4 rounded border border-gray-200"><span className="block text-gray-500 text-xs uppercase font-bold mb-1">Nama Peserta</span><span className="font-bold text-gray-800 text-lg">{userData.name}</span></div>
            <div className="bg-blue-50 p-4 rounded border border-blue-200"><span className="block text-blue-600 text-xs uppercase font-bold mb-1">Pilihan 1</span><div className="font-bold text-gray-800 mb-1 leading-tight">{userData.display1 || "-"}</div>{userData.pg1 && <div className="text-xs text-blue-700 font-mono">Target PG: {userData.pg1}</div>}</div>
            <div className="bg-gray-50 p-4 rounded border border-gray-200"><span className="block text-gray-500 text-xs uppercase font-bold mb-1">Pilihan 2</span><div className="font-bold text-gray-800 mb-1 leading-tight">{userData.display2 || "-"}</div>{userData.pg2 && <div className="text-xs text-gray-600 font-mono">Target PG: {userData.pg2}</div>}</div>
        </div>
        <div className="space-y-4 text-gray-700 text-sm mb-8 border p-4 rounded-lg bg-gray-50 h-56 overflow-y-auto">
            <h3 className="font-bold text-gray-800 border-b pb-2">Peraturan Ujian CBT:</h3>
            <ul className="list-disc pl-5 space-y-2">
                <li>Waktu ujian akan berjalan otomatis saat soal dibuka.</li>
                <li>Dilarang membuka tab lain, browser lain, atau aplikasi lain.</li>
                <li>Gunakan waktu sebaik mungkin. Tidak ada pengurangan nilai untuk jawaban salah (sistem IRT).</li>
                <li>Tombol "Selesai" akan muncul otomatis jika waktu habis.</li>
                <li>Pastikan koneksi internet stabil.</li>
            </ul>
        </div>
        <div className="flex gap-4"><button onClick={onBack} className="w-1/3 py-3 rounded-lg font-bold text-gray-600 border border-gray-300 hover:bg-gray-100">Ubah Jurusan</button><button onClick={onStart} className="w-2/3 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2 animate-pulse">SAYA SIAP MENGERJAKAN <ArrowRight size={18}/></button></div>
      </div>
    </div>
  );
};

export const ResultSummary = ({ result, onBack }) => {
    // ... (Sama seperti sebelumnya) ...
    // Agar hemat karakter, bagian ResultSummary tidak saya tulis ulang penuh 
    // karena tidak ada perubahan logika, hanya MajorSelection yang berubah.
    // Jika Anda ingin full code ResultSummary, pakai yang dari jawaban sebelumnya.
    return null; 
};