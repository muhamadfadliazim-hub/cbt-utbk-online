import React from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { API_URL } from './config'; // Import API_URL

const UploadExam = ({ onBack }) => {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      // PERBAIKAN: Menggunakan Backtick (`)
      const response = await fetch(`${API_URL}/upload-exam`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Upload berhasil!');
        if(onBack) onBack();
      } else {
        alert('Gagal upload: ' + (data.detail || 'Error tidak diketahui'));
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan koneksi.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-lg w-full">
        <button onClick={onBack} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition"><ArrowLeft size={20} className="mr-2"/> Kembali</button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Upload className="text-indigo-600"/> Upload Paket Soal Manual
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Judul Ujian</label>
                <input name="title" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" required placeholder="Contoh: Matematika Dasar"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Durasi (Menit)</label>
                    <input name="duration" type="number" className="w-full p-3 border rounded-lg" required placeholder="60"/>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">Kode Singkat</label>
                    <input name="description" className="w-full p-3 border rounded-lg" required placeholder="MATDAS"/>
                </div>
            </div>
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">File Excel Soal</label>
                <input name="file" type="file" accept=".xlsx" className="w-full p-2 border rounded-lg bg-gray-50 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required/>
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 shadow-lg transition mt-4">
                Mulai Upload
            </button>
        </form>
      </div>
    </div>
  );
};

export default UploadExam;