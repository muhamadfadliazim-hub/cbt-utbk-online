import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, Upload, FileText, Users, LogOut, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Search, X, Filter, Clock, Key, Building2, PieChart, FileCode, Info, Menu } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- URUTAN KOLOM BAKU (PENTING AGAR TIDAK GESER) ---
const EXAM_ORDER = ["PU", "PBM", "PPU", "PK", "LBI", "LBE", "PM"];

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [allowedUsers, setAllowedUsers] = useState('');
  const [users, setUsers] = useState([]);
  const [recap, setRecap] = useState([]);
  const [majors, setMajors] = useState([]); 
  const [isReleased, setIsReleased] = useState(false);
  const [isMajorSelectionEnabled, setIsMajorSelectionEnabled] = useState(true);
  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [previewData, setPreviewData] = useState(null); 
  const [analysisData, setAnalysisData] = useState(null); 
  const [activeAnalysisId, setActiveAnalysisId] = useState(null); 
  const [showPreview, setShowPreview] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false); 
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudentDetail, setSelectedStudentDetail] = useState(null);
  const [selectedWhitelist, setSelectedWhitelist] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student' });
  const [newMajor, setNewMajor] = useState({ university: '', name: '', passing_grade: '' }); 
  const [selectedIds, setSelectedIds] = useState([]); 
  const [selectedRecapPeriod, setSelectedRecapPeriod] = useState('');

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
      return <span key={index}>{part}</span>;
    });
  };

  const fetchPeriods = useCallback(() => { fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[])); }, []);
  const fetchUsers = useCallback(() => { fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>setUsers(Array.isArray(d)?d:[])); }, []);
  const fetchMajors = useCallback(() => { fetch(`${API_URL}/majors`).then(r=>r.json()).then(d=>setMajors(Array.isArray(d)?d:[])); }, []);
  const fetchConfigs = useCallback(() => {
      fetch(`${API_URL}/config/release`).then(r=>r.json()).then(d=>setIsReleased(d.value === 'true'));
      fetch(`${API_URL}/config/enable_major_selection`).then(r=>r.json()).then(d=>setIsMajorSelectionEnabled(d.value === 'true'));
  }, []);
  const fetchRecap = useCallback(() => {
      const url = selectedRecapPeriod ? `${API_URL}/admin/recap?period_id=${selectedRecapPeriod}` : `${API_URL}/admin/recap`;
      fetch(url).then(r=>r.json()).then(d=>setRecap(Array.isArray(d)?d:[]));
  }, [selectedRecapPeriod]);

  useEffect(() => { fetchUsers(); fetchConfigs(); if (tab === 'periods') fetchPeriods(); if (tab === 'recap') { fetchPeriods(); fetchRecap(); } if (tab === 'majors') fetchMajors(); }, [tab, fetchPeriods, fetchUsers, fetchRecap, fetchConfigs, fetchMajors]);
  useEffect(() => { if (tab === 'recap') fetchRecap(); }, [selectedRecapPeriod, fetchRecap, tab]);

  const handleAddMajor = (e) => {
      e.preventDefault();
      fetch(`${API_URL}/majors`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({university: newMajor.university, name: newMajor.name, passing_grade: parseFloat(newMajor.passing_grade)})})
      .then(r=>r.json()).then(d=>{ alert(d.message); setNewMajor({university:'',name:'',passing_grade:''}); fetchMajors(); });
  };
  const handleDeleteMajor = (id) => { if(window.confirm("Hapus?")) fetch(`${API_URL}/majors/${id}`, {method:'DELETE'}).then(()=>fetchMajors()); };
  const handleBulkUploadMajors = (e) => {
      const f = e.target.files[0]; if(!f)return;
      const d = new FormData(); d.append('file', f);
      fetch(`${API_URL}/admin/majors/bulk`, {method:'POST', body:d}).then(r=>r.json()).then(d=>{ alert(d.message); fetchMajors(); });
  };

  const toggleConfig = (k, v) => {
      const nv = !v; if(k==='release_announcement') setIsReleased(nv); if(k==='enable_major_selection') setIsMajorSelectionEnabled(nv);
      fetch(`${API_URL}/config/${k}`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({value:nv?"true":"false"})}).then(r=>r.json()).then(d=>{
          if(k==='release_announcement') setIsReleased(d.value==='true'); if(k==='enable_major_selection') setIsMajorSelectionEnabled(d.value==='true');
      });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF('landscape'); 
    doc.setFontSize(18); doc.text("REKAPITULASI HASIL UJIAN (CBT)", 14, 15);
    doc.setFontSize(10); doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);
    doc.text(`Periode: ${selectedRecapPeriod ? (periods.find(p => p.id === parseInt(selectedRecapPeriod))?.name || "Periode Tertentu") : "Semua Data"}`, 14, 27);

    const tableColumn = ["No", "Nama Siswa", "Username", ...EXAM_ORDER, "Avg", "Status"];
    const tableRows = [];
    recap.forEach((r, index) => {
        const scores = EXAM_ORDER.map(key => r[key] || 0);
        tableRows.push([index + 1, r.full_name, r.username, ...scores, r.average, r.status]);
    });

    autoTable(doc, {
        head: [tableColumn], body: tableRows, startY: 35, theme: 'grid', styles: { fontSize: 9, cellPadding: 2 },
        headStyles: { fillColor: [49, 46, 129], textColor: [255, 255, 255], fontStyle: 'bold' }, 
        alternateRowStyles: { fillColor: [245, 247, 255] }, 
        didParseCell: function(data) {
            if (data.section === 'body' && data.column.index === (tableColumn.length - 1)) { 
                const text = data.cell.raw;
                if (text && text.startsWith("LULUS")) { data.cell.styles.textColor = [0, 150, 0]; data.cell.styles.fontStyle = 'bold'; } 
                else { data.cell.styles.textColor = [200, 0, 0]; data.cell.styles.fontStyle = 'bold'; }
            }
        }
    });
    doc.save('Laporan_Rekap_Nilai_CBT.pdf');
  };

  const toggleUserWhitelist = (u) => { setSelectedWhitelist(selectedWhitelist.includes(u) ? selectedWhitelist.filter(x=>x!==u) : [...selectedWhitelist, u]); };
  const handleCreatePeriod = (e) => { e.preventDefault(); let allowed = selectedWhitelist.length>0?selectedWhitelist.join(','):(allowedUsers.trim()||null); fetch(`${API_URL}/admin/periods`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:newPeriodName,allowed_usernames:allowed})}).then(r=>r.json()).then(d=>{alert(d.message); setNewPeriodName(''); setAllowedUsers(''); setSelectedWhitelist([]); fetchPeriods();}); };
  const togglePeriodActive = (id, s) => fetch(`${API_URL}/admin/periods/${id}/toggle`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!s})}).then(()=>fetchPeriods());
  const togglePeriodSubmit = (id, s) => fetch(`${API_URL}/admin/periods/${id}/toggle-submit`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!s})}).then(()=>fetchPeriods());
  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) fetch(`${API_URL}/admin/periods/${id}`, {method:'DELETE'}).then(()=>fetchPeriods()); };
  const handleUploadQuestion = (eid, f) => { const d=new FormData(); d.append('file',f); const btn=document.getElementById(`btn-upload-${eid}`); if(btn)btn.innerText="Uploading..."; fetch(`${API_URL}/admin/upload-questions/${eid}`, {method:'POST', body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchPeriods();}).finally(()=>{if(btn)btn.innerText="Upload";}); };
  const handleDownloadTemplate = () => window.open(`${API_URL}/admin/download-template`, '_blank');
  const handlePreviewExam = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r=>r.json()).then(d=>{setPreviewData(d); setShowPreview(true);}).catch(e => alert("Gagal: " + e.message)); };
  const handleShowAnalysis = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/analysis`).then(r => r.json()).then(d => { setAnalysisData(d); setActiveAnalysisId(eid); setShowAnalysis(true); }).catch(e => alert("Gagal memuat analisis")); };
  const handleDownloadAnalysisExcel = () => { if (activeAnalysisId) { window.open(`${API_URL}/admin/exams/${activeAnalysisId}/analysis/download`, '_blank'); } };
  const handleViewStudentDetail = (studentData) => { setSelectedStudentDetail(studentData); setShowDetailModal(true); };
  const handleResetResult = (uid, eid) => { if(window.confirm("Reset?")) fetch(`${API_URL}/admin/reset-result`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_id:uid, exam_id:eid})}).then(()=>fetchRecap()); };
  const handleAddUser = (e) => { e.preventDefault(); fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)}).then(()=>fetchUsers()); };
  const handleBulkDelete = () => { if(selectedIds.length>0 && window.confirm("Hapus?")) fetch(`${API_URL}/admin/users/delete-bulk`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({user_ids:selectedIds})}).then(()=>fetchUsers()); };
  const handleBulkUpload = (e) => { const f=e.target.files[0]; if(!f)return; const d=new FormData(); d.append('file',f); fetch(`${API_URL}/admin/users/bulk`,{method:'POST',body:d}).then(r=>r.json()).then(d=>{alert(d.message); fetchUsers();}) };
  const handleDownloadExcel = () => { const url = selectedRecapPeriod ? `${API_URL}/admin/recap/download?period_id=${selectedRecapPeriod}` : `${API_URL}/admin/recap/download`; window.open(url, '_blank'); };
  const handleSelectAll = (e) => setSelectedIds(e.target.checked ? users.map(u=>u.id) : []);
  const handleSelectOne = (id) => setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i=>i!==id) : [...selectedIds, id]);
  const handleChangePassword = (uid) => { const newPass = prompt("Password Baru:"); if(newPass) fetch(`${API_URL}/admin/users/${uid}/password`, {method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({new_password:newPass})}).then(r=>r.json()).then(d=>alert(d.message)); };
  
  // FIX: Status Logic yang PASTI muncul
  const getStatusBadge = (s) => {
      if (s && s.startsWith('LULUS')) {
          return <span className="text-green-600 font-bold text-xs flex items-center gap-1"><CheckCircle size={12}/> {s}</span>;
      }
      return <span className="text-red-600 font-bold text-xs flex items-center gap-1"><XCircle size={12}/> TIDAK LULUS</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans text-gray-800">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden bg-indigo-900 text-white p-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
          <div className="font-bold text-lg flex items-center gap-2"><Building2 size={20}/> Admin Panel</div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-indigo-800 rounded">
              {isMobileMenuOpen ? <X size={24}/> : <Menu size={24}/>}
          </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`
          bg-indigo-900 text-white p-6 flex flex-col 
          fixed md:relative inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          mt-16 md:mt-0 shadow-xl md:shadow-none
      `}>
          <h1 className="text-2xl font-bold mb-8 hidden md:block">Admin Panel</h1>
          <nav className="space-y-4 flex-1">
              <button onClick={()=>{setTab('periods'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='periods'?'bg-indigo-700':''}`}><FileText size={18}/> Soal & Ujian</button>
              <button onClick={()=>{setTab('majors'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='majors'?'bg-indigo-700':''}`}><Building2 size={18}/> Manajemen Jurusan</button>
              <button onClick={()=>{setTab('users'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='users'?'bg-indigo-700':''}`}><Users size={18}/> User & Siswa</button>
              <button onClick={()=>{setTab('recap'); setIsMobileMenuOpen(false)}} className={`w-full flex items-center gap-3 p-3 rounded ${tab==='recap'?'bg-indigo-700':''}`}><FileText size={18}/> Rekap Nilai</button>
          </nav>
          <div className="mt-auto pt-6 border-t border-indigo-700 space-y-3">
              <div className="text-xs font-bold text-indigo-300 uppercase">Pengaturan</div>
              <button onClick={()=>toggleConfig('enable_major_selection', isMajorSelectionEnabled)} className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition ${isMajorSelectionEnabled ? 'bg-green-600' : 'bg-red-500'}`}>Jurusan: {isMajorSelectionEnabled ? "ON" : "OFF"} {isMajorSelectionEnabled ? <Unlock size={14}/> : <Lock size={14}/>}</button>
              <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-bold transition ${isReleased ? 'bg-green-600' : 'bg-orange-500'}`}>Pengumuman: {isReleased ? "RILIS" : "TUTUP"} {isReleased ? <Unlock size={14}/> : <Lock size={14}/>}</button>
              <button onClick={onLogout} className="flex items-center gap-3 p-3 rounded hover:bg-red-600 bg-indigo-800 mt-4"><LogOut size={18}/> Keluar</button>
          </div>
      </aside>
      
      {/* OVERLAY */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <main className="flex-1 p-4 md:p-8 overflow-y-auto relative h-screen">
        {showPreview && previewData && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><div><h3 className="text-xl font-bold">Preview: {previewData.title}</h3></div><button onClick={()=>setShowPreview(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">{previewData.questions.map((q,i)=>(
                        <div key={q.id} className="border p-4 rounded bg-gray-50">
                            <div className="font-bold mb-2 text-indigo-700">No. {i+1} <span className="text-xs text-gray-500 font-normal ml-2">Bobot: {q.difficulty}</span></div>
                            <div className="mb-4">{renderText(q.text)}</div>
                            <div className="space-y-1 ml-4 border-l-2 pl-3 border-gray-200">{q.options.map(opt => (<div key={opt.id} className={`text-sm ${opt.is_correct ? 'text-green-700 font-bold bg-green-50 px-2 py-1 rounded inline-block' : 'text-gray-600'}`}><strong>{opt.id}.</strong> {renderText(opt.label)} {opt.is_correct && " ✅"}</div>))}</div>
                        </div>))}</div>
                </div>
            </div>
        )}

        {showAnalysis && analysisData && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <div><h3 className="text-xl font-bold">Analisis Butir Soal</h3></div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleDownloadAnalysisExcel} className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-2 hover:bg-green-700"><Download size={14}/> Excel</button>
                            <button onClick={()=>setShowAnalysis(false)} className="bg-gray-200 p-1.5 rounded hover:bg-gray-300"><X size={18}/></button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left border rounded-lg">
                                <thead className="bg-indigo-50 text-indigo-900 font-bold"><tr><th className="p-3 border-b w-10">No</th><th className="p-3 border-b">Isi Soal</th><th className="p-3 border-b text-center">Diff (IRT)</th><th className="p-3 border-b text-center">Jawab</th><th className="p-3 border-b text-center">Benar</th><th className="p-3 border-b text-center">% Benar</th></tr></thead>
                                <tbody>{analysisData.stats.map((item, idx) => (<tr key={item.id} className="hover:bg-gray-50 border-b"><td className="p-3 text-center">{idx + 1}</td><td className="p-3 text-gray-700 min-w-[200px]">{renderText(item.text)}</td><td className="p-3 text-center font-mono font-bold text-blue-600">{item.difficulty}</td><td className="p-3 text-center">{item.attempts}</td><td className="p-3 text-center text-green-600 font-bold">{item.correct}</td><td className="p-3 text-center"><div className="w-full bg-gray-200 rounded-full h-2.5 mb-1"><div className="bg-blue-600 h-2.5 rounded-full" style={{width: `${item.percentage}%`}}></div></div><span className="text-xs font-bold">{item.percentage}%</span></td></tr>))}</tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showDetailModal && selectedStudentDetail && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col h-[70vh]">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
                        <div><h3 className="text-lg font-bold text-indigo-900">Rincian Jawaban Salah</h3><p className="text-sm text-gray-500">{selectedStudentDetail.full_name}</p></div><button onClick={()=>setShowDetailModal(false)}><X/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {["PU","PBM","PPU","PK","LBI","LBE","PM"].map(code => {
                            const wrongList = selectedStudentDetail.details ? selectedStudentDetail.details[code] : null;
                            return (
                                <div key={code} className="border rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-center mb-2"><span className="font-bold text-indigo-800">{code}</span>{wrongList ? (<span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded font-bold">Salah {wrongList.split(',').length} Soal</span>) : (<span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded font-bold">Benar Semua / Belum Ujian</span>)}</div>
                                    <div className="text-sm text-gray-700">{wrongList ? (<div><span className="font-bold text-red-600 mr-2">Nomor Salah:</span><span className="font-mono tracking-widest">{wrongList.replace(/,/g, ', ')}</span></div>) : <span className="italic text-gray-400">Tidak ada data kesalahan.</span>}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )}

        {showUserModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col h-[70vh]">
                    <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-xl"><h3 className="font-bold">Pilih Peserta</h3><button onClick={()=>setShowUserModal(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">{users.filter(u=>u.role==='student').map(u=>(<label key={u.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 border rounded cursor-pointer"><input type="checkbox" checked={selectedWhitelist.includes(u.username)} onChange={()=>toggleUserWhitelist(u.username)}/><div><div className="font-bold text-sm">{u.full_name}</div><div className="text-xs text-gray-400">{u.username}</div></div></label>))}</div>
                    <div className="p-4 border-t text-right"><button onClick={()=>setShowUserModal(false)} className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-bold">Selesai</button></div>
                </div>
            </div>
        )}

        {tab === 'majors' && (
            <div><h2 className="text-2xl font-bold mb-6">Manajemen Jurusan</h2>
            <div className="bg-white p-6 rounded shadow mb-6 border-l-4 border-indigo-500"><div className="flex flex-col md:flex-row gap-2 items-end"><div className="flex-1 w-full"><label className="text-xs font-bold text-gray-500">Universitas</label><input className="w-full p-2 border rounded" placeholder="UI" value={newMajor.university} onChange={e=>setNewMajor({...newMajor, university:e.target.value})}/></div><div className="flex-[2] w-full"><label className="text-xs font-bold text-gray-500">Jurusan</label><input className="w-full p-2 border rounded" placeholder="Kedokteran" value={newMajor.name} onChange={e=>setNewMajor({...newMajor, name:e.target.value})}/></div><div className="w-full md:w-32"><label className="text-xs font-bold text-gray-500">PG</label><input type="number" step="0.01" className="w-full p-2 border rounded" placeholder="650" value={newMajor.passing_grade} onChange={e=>setNewMajor({...newMajor, passing_grade:e.target.value})}/></div><button onClick={handleAddMajor} className="w-full md:w-auto bg-green-600 text-white px-6 py-2 rounded font-bold h-[42px]">Simpan</button></div><div className="mt-4 pt-4 border-t"><label className="text-blue-600 cursor-pointer text-sm hover:underline font-bold flex items-center gap-2"><Upload size={16}/> Upload Excel Jurusan<input type="file" hidden accept=".xlsx" onChange={handleBulkUploadMajors}/></label></div></div>
            <div className="bg-white shadow rounded overflow-hidden overflow-x-auto"><div className="max-h-[600px] overflow-y-auto"><table className="w-full text-sm text-left"><thead className="bg-indigo-50 text-indigo-900 sticky top-0"><tr><th className="p-4">Universitas</th><th className="p-4">Jurusan</th><th className="p-4">PG</th><th className="p-4 text-center">Aksi</th></tr></thead><tbody className="divide-y">{majors.map(m=>(<tr key={m.id} className="hover:bg-gray-50"><td className="p-4 font-bold text-gray-700">{m.university}</td><td className="p-4">{m.name}</td><td className="p-4"><span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-bold">{m.passing_grade}</span></td><td className="p-4 text-center"><button onClick={()=>handleDeleteMajor(m.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded"><Trash2 size={16}/></button></td></tr>))}</tbody></table></div></div>
            </div>
        )}

        {tab === 'periods' && (
            <div><h2 className="text-2xl font-bold mb-6">Manajemen Soal</h2><div className="flex justify-end mb-4"><button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded font-bold shadow"><Download size={18}/> Template</button></div><div className="bg-white p-6 rounded shadow mb-6"><div className="flex flex-col md:flex-row gap-4 items-end"><div className="flex-1 w-full"><label className="text-sm font-bold text-gray-600">Nama Periode</label><input className="w-full p-2 border rounded" value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)}/></div><div className="w-full md:w-1/3"><label className="text-sm font-bold text-gray-600">Akses</label><div onClick={()=>setShowUserModal(true)} className="w-full p-2 border rounded bg-gray-50 cursor-pointer flex justify-between items-center"><span className="text-sm text-gray-600">{selectedWhitelist.length>0?`${selectedWhitelist.length} Peserta`:"Semua (Public)"}</span><Users size={16}/></div></div><button onClick={handleCreatePeriod} className="w-full md:w-auto bg-indigo-600 text-white px-6 py-2 rounded font-bold">Buat</button></div></div>
            <div className="space-y-4">{periods.map(p=>(<div key={p.id} className="bg-white rounded shadow border overflow-hidden"><div className="p-4 bg-gray-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><div className="flex gap-4 w-full md:w-auto"><button onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)}>{expandedPeriod===p.id?<ChevronUp/>:<ChevronDown/>}</button><div><h3 className="font-bold">{p.name}</h3><div className="flex gap-2 text-xs"><span className={`px-2 py-0.5 rounded font-bold ${p.is_active?'bg-green-100 text-green-700':'bg-gray-200'}`}>{p.is_active?'PUBLIK':'DRAFT'}</span>{p.allowed_usernames && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-bold">TERBATAS</span>}</div></div></div><div className="flex flex-wrap gap-2 w-full md:w-auto"><button onClick={()=>togglePeriodSubmit(p.id, p.allow_submit)} className={`flex-1 md:flex-none justify-center px-3 py-1 rounded text-sm font-bold flex items-center gap-2 ${p.allow_submit?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>{p.allow_submit?<Unlock size={14}/>:<Lock size={14}/>} Submit</button><button onClick={()=>togglePeriodActive(p.id, p.is_active)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-orange-100 text-orange-700 rounded text-sm font-bold flex items-center gap-2">{p.is_active?<EyeOff size={14}/>:<Eye size={14}/>} {p.is_active?'Sembunyi':'Tampil'}</button><button onClick={()=>handleDeletePeriod(p.id)} className="p-2 bg-red-50 text-red-600 rounded border border-red-200"><Trash2 size={16}/></button></div></div>{expandedPeriod===p.id && <div className="p-4 grid gap-3">{p.exams.map(e=>(<div key={e.id} className="border p-3 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-3"><div><div className="font-bold">{e.title}</div><div className="text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {e.duration}m | {e.questions.length} Soal</div></div>
            <div className="flex gap-2 w-full md:w-auto">
                <button onClick={()=>handlePreviewExam(e.id)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-bold flex items-center gap-1"><Search size={12}/> Lihat</button>
                <button onClick={()=>handleShowAnalysis(e.id)} className="flex-1 md:flex-none justify-center px-3 py-1 bg-purple-100 text-purple-700 rounded text-xs font-bold flex items-center gap-1"><PieChart size={12}/> Analisis</button>
                <label id={`btn-upload-${e.id}`} className="flex-1 md:flex-none justify-center px-3 py-1 bg-blue-600 text-white rounded text-xs font-bold cursor-pointer hover:bg-blue-700 flex items-center gap-1"><Upload size={12}/> Upload<input type="file" hidden accept=".xlsx" onChange={ev=>handleUploadQuestion(e.id,ev.target.files[0])}/></label>
            </div></div>))}</div>}</div>))}</div></div>)}

        {tab === 'users' && (<div><div className="flex justify-between mb-6"><h2 className="text-2xl font-bold">User Management</h2>{selectedIds.length>0&&<button onClick={handleBulkDelete} className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2"><Trash2 size={16}/> Hapus {selectedIds.length}</button>}</div><div className="bg-white p-4 rounded shadow mb-6 flex flex-col md:flex-row gap-2"><input className="border p-2 rounded flex-1" placeholder="Username" value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})}/><input className="border p-2 rounded flex-1" placeholder="Nama" value={newUser.full_name} onChange={e=>setNewUser({...newUser, full_name:e.target.value})}/><input className="border p-2 rounded flex-1" placeholder="Pass" value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})}/><select className="border p-2 rounded bg-gray-50" value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}><option value="student">Siswa</option><option value="admin">Admin</option></select><button onClick={handleAddUser} className="bg-green-600 text-white px-4 py-2 rounded font-bold"><Plus size={16}/></button></div><div className="mb-4"><label className="text-blue-600 cursor-pointer text-sm hover:underline"><Upload size={14} className="inline mr-1"/>Upload Excel User<input type="file" hidden accept=".xlsx" onChange={handleBulkUpload}/></label></div><div className="bg-white shadow rounded overflow-hidden overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-100"><tr><th className="p-3 w-10"><input type="checkbox" onChange={handleSelectAll} checked={users.length>0&&selectedIds.length===users.length}/></th><th className="p-3 text-left">Nama</th><th className="p-3 text-left">Username</th><th className="p-3 text-left">Role</th><th className="p-3 text-center">Aksi</th></tr></thead><tbody>{users.map(u=>(<tr key={u.id} className="border-b"><td className="p-3 text-center"><input type="checkbox" checked={selectedIds.includes(u.id)} onChange={()=>handleSelectOne(u.id)}/></td><td className="p-3">{u.full_name}</td><td className="p-3">{u.username}</td><td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-bold ${u.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'}`}>{u.role.toUpperCase()}</span></td><td className="p-3 text-center"><button onClick={()=>handleChangePassword(u.id)} className="text-gray-500 hover:text-indigo-600" title="Ganti Password"><Key size={16}/></button></td></tr>))}</tbody></table></div></div>)}
        
        {/* FIX: TAB REKAP DENGAN CARD VIEW (MOBILE) & TABLE VIEW (DESKTOP) */}
        {tab === 'recap' && (<div className="overflow-x-auto pb-20"><div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4"><div><h2 className="text-2xl font-bold">Rekap Nilai</h2><div className="flex items-center gap-2 mt-2"><Filter size={16} className="text-gray-500"/><select className="p-2 border rounded w-full md:w-auto" value={selectedRecapPeriod} onChange={e=>setSelectedRecapPeriod(e.target.value)}><option value="">-- Semua Periode --</option>{periods.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div></div><div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button onClick={handleDownloadPDF} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded shadow text-sm font-bold hover:bg-red-700"><FileCode size={16}/> PDF</button>
            <button onClick={handleDownloadExcel} className="flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 bg-white border rounded shadow text-sm font-bold"><Download size={16}/> Excel</button>
            <button onClick={()=>toggleConfig('release_announcement', isReleased)} className={`flex-1 md:flex-none justify-center flex items-center gap-2 px-4 py-2 text-white rounded shadow text-sm font-bold ${isReleased?'bg-green-600':'bg-orange-500'}`}>{isReleased?<Unlock size={16}/>:<Lock size={16}/>} {isReleased?'Tutup':'Rilis'}</button></div></div>
            
            {/* TAMPILAN MOBILE: KARTU (CARD VIEW) */}
            <div className="md:hidden space-y-4">
                {recap.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <div className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                    {r.full_name} 
                                    <button onClick={()=>handleViewStudentDetail(r)} className="text-blue-600 bg-blue-50 p-1 rounded-full"><Info size={16}/></button>
                                </div>
                                <div className="text-sm text-gray-500">{r.username}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-400 font-bold mb-1">RATA-RATA</div>
                                <div className="text-xl font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded inline-block">{r.average}</div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {EXAM_ORDER.map(k => (
                                <div key={k} className="text-center bg-gray-50 p-2 rounded">
                                    <div className="text-[10px] font-bold text-gray-500">{k}</div>
                                    <div className="font-bold text-gray-700">{r[k]||0}</div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center border-t pt-3">
                            <div>{getStatusBadge(r.status)}</div>
                            <div className="flex gap-1 flex-wrap justify-end max-w-[50%]">
                                {r.completed_exams.map(e => (
                                    <button key={e.exam_id} onClick={()=>handleResetResult(r.id,e.exam_id)} className="px-2 py-1 bg-red-100 text-red-600 text-[10px] rounded font-bold border border-red-200">Reset {e.code}</button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* TAMPILAN DESKTOP: TABEL (TABLE VIEW) */}
            <div className="hidden md:block bg-white shadow rounded overflow-hidden border overflow-x-auto">
            <table className="w-full text-sm text-left"><thead className="bg-indigo-900 text-white"><tr><th className="p-3" rowSpan="2">Nama</th><th className="p-2 text-center bg-indigo-800" colSpan="7">Skor IRT</th><th className="p-3 text-center bg-blue-900" rowSpan="2">Avg</th><th className="p-3 bg-indigo-800" rowSpan="2">Ket</th><th className="p-3 bg-red-900" rowSpan="2">Reset</th></tr>
            <tr>{EXAM_ORDER.map(s=><th key={s} className="p-1 text-center text-xs bg-indigo-700">{s}</th>)}</tr>
            </thead><tbody className="divide-y">{recap.map((r,i)=>(<tr key={i} className="hover:bg-gray-50">
            <td className="p-3"><div className="flex items-center gap-2"><button onClick={()=>handleViewStudentDetail(r)} className="text-blue-600 hover:text-blue-800 bg-blue-50 p-1 rounded transition" title="Lihat Rincian Jawaban Salah"><Info size={16}/></button><div><div className="font-bold text-gray-800">{r.full_name}</div><div className="text-xs text-gray-400 font-normal">{r.username}</div></div></div></td>
            {EXAM_ORDER.map(k=><td key={k} className="p-2 text-center text-gray-600">{r[k]||0}</td>)}
            <td className="p-3 text-center font-bold text-blue-700 bg-blue-50">{r.average}</td><td className="p-3">{getStatusBadge(r.status)}</td><td className="p-3 text-center">{r.completed_exams.map(e=><button key={e.exam_id} onClick={()=>handleResetResult(r.id,e.exam_id)} className="px-2 py-1 bg-red-100 text-red-600 text-[10px] rounded border border-red-200 m-0.5 hover:bg-red-600 hover:text-white">{e.code}×</button>)}</td></tr>))}</tbody></table></div></div>)}
      </main>
    </div>
  );
};
export default AdminDashboard;