import React, { useState, useEffect } from 'react';
import { CheckCircle, BookOpen, Clock, School, Search, ChevronRight } from 'lucide-react';

// --- 1. KOMPONEN PILIH JURUSAN ---
export const MajorSelection = ({ onNext }) => {
  const [majors, setMajors] = useState([]);
  const [search, setSearch] = useState("");
  const [choice1, setChoice1] = useState(null);
  const [choice2, setChoice2] = useState(null);

  useEffect(() => {
    // Ambil data jurusan dari API (Pastikan API_URL sesuai settingan global Anda jika perlu, 
    // tapi disini kita fetch relative path atau hardcode sementara jika context tidak dikirim)
    // Untuk aman, kita asumsikan fetch relatif ke proxy atau URL standar
    fetch("http://127.0.0.1:8000/majors")
      .then(r => r.json())
      .then(setMajors)
      .catch(e => console.error("Gagal load jurusan", e));
  }, []);

  const filtered = majors.filter(m => 
    m.university.toLowerCase().includes(search.toLowerCase()) || 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (m) => {
    if (!choice1) setChoice1(m);
    else if (!choice2 && m.id !== choice1.id) setChoice2(m);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-indigo-900 text-white">
          <h2 className="text-2xl font-bold mb-2">Pilih Jurusan Target</h2>
          <p className="text-indigo-200">Tentukan PTN impianmu sekarang.</p>
        </div>
        
        <div className="p-6 bg-indigo-50 border-b border-indigo-100 flex gap-4">
            <div className="flex-1 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                <div className="text-xs text-gray-500 font-bold uppercase">Pilihan 1</div>
                <div className="font-bold text-indigo-900 truncate">{choice1 ? `${choice1.university} - ${choice1.name}` : "Belum dipilih"}</div>
                {choice1 && <button onClick={()=>setChoice1(null)} className="text-xs text-red-500 mt-1 hover:underline">Hapus</button>}
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl border border-indigo-100 shadow-sm">
                <div className="text-xs text-gray-500 font-bold uppercase">Pilihan 2</div>
                <div className="font-bold text-indigo-900 truncate">{choice2 ? `${choice2.university} - ${choice2.name}` : "Belum dipilih"}</div>
                {choice2 && <button onClick={()=>setChoice2(null)} className="text-xs text-red-500 mt-1 hover:underline">Hapus</button>}
            </div>
        </div>

        <div className="p-6">
            <div className="relative mb-4">
                <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
                <input className="w-full pl-10 p-3 border rounded-xl bg-gray-50 focus:bg-white transition" placeholder="Cari Universitas atau Prodi..." value={search} onChange={e=>setSearch(e.target.value)}/>
            </div>
            <div className="h-64 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {filtered.map(m => (
                    <button key={m.id} onClick={()=>handleSelect(m)} className="w-full text-left p-3 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-100 transition group">
                        <div className="font-bold text-gray-800 group-hover:text-indigo-700">{m.university}</div>
                        <div className="text-sm text-gray-500">{m.name}</div>
                    </button>
                ))}
            </div>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end">
            <button 
                onClick={() => onNext({ choice1_id: choice1.id, choice2_id: choice2 ? choice2.id : null })} 
                disabled={!choice1}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
                Simpan & Lanjut <ChevronRight size={18}/>
            </button>
        </div>
      </div>
    </div>
  );
};

// --- 2. KOMPONEN KONFIRMASI MULAI ---
export const Confirmation = ({ userData, onStart, onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6 text-center">Konfirmasi Ujian</h2>
            
            <div className="space-y-4 mb-8">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><School className="text-indigo-600"/></div>
                    <div><div className="text-xs text-gray-500 font-bold uppercase">Nama Peserta</div><div className="font-bold text-gray-800">{userData.name}</div></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-4">
                    <div className="bg-white p-2 rounded-lg shadow-sm"><BookOpen className="text-purple-600"/></div>
                    <div><div className="text-xs text-gray-500 font-bold uppercase">Mode Ujian</div><div className="font-bold text-gray-800">CBT Online</div></div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 leading-relaxed">
                    <strong className="block mb-1">Perhatian:</strong>
                    Waktu akan berjalan otomatis saat Anda menekan tombol mulai. Pastikan koneksi internet stabil.
                </div>
            </div>

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 py-3 font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition">Batal</button>
                <button onClick={onStart} className="flex-1 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl transition">MULAI SEKARANG</button>
            </div>
        </div>
    </div>
  );
};

// --- 3. KOMPONEN HASIL (VERSI SIMPEL / BLIND) ---
export const ResultSummary = ({ onBack }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-lg w-full border border-gray-100 relative">
        
        {/* Ikon Sukses Besar */}
        <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
          <CheckCircle size={48} />
        </div>

        <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Ujian Selesai!</h2>
        
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
            <p className="text-gray-600 text-lg leading-relaxed">
              Jawaban Anda telah <strong>berhasil disimpan</strong> ke dalam sistem.
            </p>
            <hr className="my-4 border-gray-200"/>
            <p className="text-sm text-gray-500">
              Rincian nilai (Skor, Benar, Salah) akan diumumkan oleh <strong>Admin/Panitia</strong>. Silakan cek dashboard Anda secara berkala.
            </p>
        </div>

        <button 
          onClick={onBack}
          className="w-full py-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition transform hover:scale-[1.02] flex items-center justify-center gap-2"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
};