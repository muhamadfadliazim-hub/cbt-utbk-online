import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, Plus, FileText, Users, LogOut, Lock, Unlock, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, XCircle, Download, Search, X, Filter, Clock, Key, Building2, PieChart, FileCode, Info, Menu, PenTool, BookOpen, Grid } from 'lucide-react';
import 'katex/dist/katex.min.css'; 
import { InlineMath } from 'react-katex';
import { API_URL } from './config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EXAM_ORDER = ["PU", "PBM", "PPU", "PK", "LBI", "LBE", "PM"];

const AdminDashboard = ({ onLogout }) => {
  const [tab, setTab] = useState('periods');
  const [periods, setPeriods] = useState([]);
  const [newPeriodName, setNewPeriodName] = useState('');
  const [allowedUsers, setAllowedUsers] = useState('');
  const [users, setUsers] = useState([]);
  const [isRandom, setIsRandom] = useState(true); 
  const [isFlexible, setIsFlexible] = useState(false); 
  const [examType, setExamType] = useState('UTBK');

  const [expandedPeriod, setExpandedPeriod] = useState(null);
  const [previewData, setPreviewData] = useState(null); 
  const [showPreview, setShowPreview] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedWhitelist, setSelectedWhitelist] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', full_name: '', role: 'student' });

  // --- SUPER MANUAL INPUT STATE ---
  const [showManualInput, setShowManualInput] = useState(false);
  const [activeExamIdForManual, setActiveExamIdForManual] = useState(null);
  const [manualQ, setManualQ] = useState({
      text: '', type: 'multiple_choice', difficulty: 1.0, reading_material: '', explanation: '',
      label_true: 'Sesuai', label_false: 'Tidak Sesuai', // Untuk Tabel
      options: []
  });
  // --------------------------------

  const renderText = (text) => {
    if (!text) return null;
    return text.split(/(\$.*?\$)/).map((part, index) => {
      if (part.startsWith('$') && part.endsWith('$')) return <InlineMath key={index} math={part.slice(1, -1)} />;
      return <span key={index} dangerouslySetInnerHTML={{ __html: part.replace(/\n/g, '<br/>') }} />;
    });
  };

  const fetchPeriods = useCallback(() => { fetch(`${API_URL}/admin/periods`).then(r=>r.json()).then(d=>setPeriods(Array.isArray(d)?d:[])); }, []);
  const fetchUsers = useCallback(() => { fetch(`${API_URL}/admin/users`).then(r=>r.json()).then(d=>setUsers(Array.isArray(d)?d:[])); }, []);
  useEffect(() => { fetchUsers(); if (tab === 'periods') fetchPeriods(); }, [tab, fetchPeriods, fetchUsers]);

  const togglePeriodActive = (id, currentStatus) => { fetch(`${API_URL}/admin/periods/${id}/toggle`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!currentStatus})}).then(fetchPeriods); };
  const togglePeriodSubmit = (id, currentStatus) => { fetch(`${API_URL}/admin/periods/${id}/toggle-submit`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({is_active:!currentStatus})}).then(fetchPeriods); };
  const handleDeletePeriod = (id) => { if(window.confirm("Hapus?")) fetch(`${API_URL}/admin/periods/${id}`, {method:'DELETE'}).then(fetchPeriods); };
  
  const handleCreatePeriod = (e) => { 
      e.preventDefault(); 
      if (!newPeriodName) return;
      fetch(`${API_URL}/admin/periods`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newPeriodName, allowed_usernames: selectedWhitelist.join(',') || null, is_random: isRandom, is_flexible: isFlexible, exam_type: examType })
      }).then(()=>{ alert("Sukses"); setNewPeriodName(''); fetchPeriods(); });
  };

  const handleAddUser = () => { 
      fetch(`${API_URL}/admin/users`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(newUser)})
      .then(()=>{ alert("User Added"); fetchUsers(); setNewUser({...newUser, username:''}); }); 
  };

  const handlePreviewExam = (eid) => { fetch(`${API_URL}/admin/exams/${eid}/preview`).then(r=>r.json()).then(d=>{setPreviewData(d); setShowPreview(true);}); };
  const handleDeleteQuestion = (qid) => { if(window.confirm("Hapus soal ini?")) fetch(`${API_URL}/admin/questions/${qid}`, { method: 'DELETE' }).then(() => { handlePreviewExam(previewData.id); fetchPeriods(); }); };

  // --- MANUAL INPUT LOGIC ---
  const openManualInput = (examId) => {
      setActiveExamIdForManual(examId);
      // Reset State
      setManualQ({
        text: '', type: 'multiple_choice', difficulty: 1.0, reading_material: '', explanation: '',
        label_true: 'Benar', label_false: 'Salah',
        options: [ { label: '', is_correct: false }, { label: '', is_correct: false }, { label: '', is_correct: false }, { label: '', is_correct: false }, { label: '', is_correct: false } ]
      });
      setShowManualInput(true);
  };

  const handleOptionChange = (idx, field, value) => {
      const newOpts = [...manualQ.options];
      newOpts[idx][field] = value;
      // Single correct logic for standard PG
      if (manualQ.type === 'multiple_choice' && field === 'is_correct' && value === true) {
          newOpts.forEach((o, i) => { if (i !== idx) o.is_correct = false; });
      }
      setManualQ({ ...manualQ, options: newOpts });
  };

  const addOption = () => setManualQ({...manualQ, options: [...manualQ.options, {label:'', is_correct:false}]});
  const removeOption = (idx) => setManualQ({...manualQ, options: manualQ.options.filter((_,i)=>i!==idx)});

  const saveManualQuestion = () => {
      if (!manualQ.text) { alert("Isi teks soal!"); return; }
      fetch(`${API_URL}/admin/exams/${activeExamIdForManual}/manual-question`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(manualQ)
      }).then(()=>{ alert("Tersimpan!"); setShowManualInput(false); fetchPeriods(); });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans text-gray-800">
      <aside className={`bg-indigo-900 text-white p-6 w-64 ${isMobileMenuOpen?'block':'hidden'} md:block`}>
          <h1 className="text-2xl font-bold mb-8">Admin Panel</h1>
          <button onClick={()=>{setTab('periods');}} className={`w-full text-left p-3 rounded ${tab==='periods'?'bg-indigo-700':''}`}><FileText className="inline mr-2"/> Soal & Ujian</button>
          <button onClick={()=>{setTab('users');}} className={`w-full text-left p-3 rounded ${tab==='users'?'bg-indigo-700':''}`}><Users className="inline mr-2"/> User Management</button>
          <button onClick={onLogout} className="w-full text-left p-3 mt-4 hover:bg-red-600"><LogOut className="inline mr-2"/> Keluar</button>
      </aside>
      
      <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen">
        {/* MODAL INPUT SOAL */}
        {showManualInput && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col h-[90vh]">
                    <div className="p-4 border-b flex justify-between items-center bg-indigo-50">
                        <h3 className="text-lg font-bold text-indigo-900 flex items-center gap-2"><PenTool/> Input Soal Lengkap</h3>
                        <button onClick={()=>setShowManualInput(false)}><X/></button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="font-bold text-sm">Tipe Soal</label>
                            <select className="w-full border p-2 rounded" value={manualQ.type} onChange={e=>setManualQ({...manualQ, type: e.target.value})}>
                                <option value="multiple_choice">Pilihan Ganda (1 Jawaban)</option>
                                <option value="complex">Pilihan Ganda Kompleks</option>
                                <option value="table_boolean">Tabel (Benar/Salah atau Custom)</option>
                                <option value="short_answer">Isian Singkat</option>
                            </select></div>
                            <div><label className="font-bold text-sm">Tingkat Kesulitan (IRT)</label><input type="number" step="0.1" className="w-full border p-2 rounded" value={manualQ.difficulty} onChange={e=>setManualQ({...manualQ, difficulty:parseFloat(e.target.value)})}/></div>
                        </div>

                        {/* WACANA */}
                        <div><label className="font-bold text-sm flex gap-2"><BookOpen size={16}/> Wacana (Opsional)</label>
                        <textarea className="w-full border p-2 rounded bg-yellow-50 h-24" placeholder="Teks bacaan..." value={manualQ.reading_material} onChange={e=>setManualQ({...manualQ, reading_material:e.target.value})}/></div>

                        {/* TEXT SOAL + MATH PREVIEW */}
                        <div><label className="font-bold text-sm">Pertanyaan (Support LaTeX $...$)</label>
                        <textarea className="w-full border p-2 rounded h-24" placeholder="Tulis soal..." value={manualQ.text} onChange={e=>setManualQ({...manualQ, text:e.target.value})}/>
                        <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-2 rounded border"><strong>Preview:</strong> {renderText(manualQ.text || "...")}</div></div>

                        {/* OPSI JAWABAN LOGIC */}
                        <div className="bg-gray-50 p-4 rounded border">
                            {manualQ.type === 'table_boolean' ? (
                                <div>
                                    <div className="flex gap-2 mb-2">
                                        <input className="border p-1 w-1/2 text-center font-bold" placeholder="Label Kiri (ex: Sesuai)" value={manualQ.label_true} onChange={e=>setManualQ({...manualQ, label_true:e.target.value})}/>
                                        <input className="border p-1 w-1/2 text-center font-bold" placeholder="Label Kanan (ex: Tidak Sesuai)" value={manualQ.label_false} onChange={e=>setManualQ({...manualQ, label_false:e.target.value})}/>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">*Tambahkan pernyataan pada baris di bawah. Centang jika jawabannya adalah "Kiri/True".</p>
                                    {manualQ.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2 mb-2">
                                            <input className="flex-1 border p-2 rounded" placeholder={`Pernyataan ${i+1}`} value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/>
                                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)}/> <span className="text-xs font-bold text-indigo-600">{opt.is_correct ? manualQ.label_true : manualQ.label_false}</span></label>
                                            <button onClick={()=>removeOption(i)} className="text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                    <button onClick={addOption} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">+ Tambah Baris</button>
                                </div>
                            ) : manualQ.type === 'short_answer' ? (
                                <div><label className="font-bold text-sm">Kunci Jawaban</label>
                                <input className="w-full border p-2 rounded" placeholder="Contoh: 45" value={manualQ.options[0]?.label || ''} onChange={e=>{const o=[...manualQ.options]; if(!o[0])o[0]={label:'',is_correct:true}; o[0].label=e.target.value; o[0].is_correct=true; setManualQ({...manualQ, options:o})}}/></div>
                            ) : (
                                <div>
                                    <div className="font-bold text-sm mb-2">Pilihan Ganda {manualQ.type==='complex' && '(Bisa > 1 Benar)'}</div>
                                    {manualQ.options.map((opt, i) => (
                                        <div key={i} className="flex items-center gap-2 mb-2">
                                            <span className="w-6 font-bold text-center">{String.fromCharCode(65+i)}</span>
                                            <input className="flex-1 border p-2 rounded" value={opt.label} onChange={e=>handleOptionChange(i,'label',e.target.value)}/>
                                            <input type="checkbox" className="w-5 h-5" checked={opt.is_correct} onChange={e=>handleOptionChange(i,'is_correct',e.target.checked)}/>
                                            <button onClick={()=>removeOption(i)} className="text-red-500"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                    <button onClick={addOption} className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">+ Tambah Opsi</button>
                                </div>
                            )}
                        </div>

                        {/* PEMBAHASAN */}
                        <div><label className="font-bold text-sm text-green-700">Pembahasan / Kunci Penyelesaian</label>
                        <textarea className="w-full border p-2 rounded h-24 bg-green-50" placeholder="Tulis pembahasan di sini..." value={manualQ.explanation} onChange={e=>setManualQ({...manualQ, explanation:e.target.value})}/></div>

                    </div>
                    <div className="p-4 border-t text-right bg-gray-50"><button onClick={saveManualQuestion} className="bg-indigo-600 text-white px-6 py-2 rounded font-bold">Simpan Soal</button></div>
                </div>
            </div>
        )}

        {/* MODAL PREVIEW */}
        {showPreview && previewData && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                    <div className="p-4 border-b flex justify-between bg-gray-50"><h3>Preview: {previewData.title}</h3><button onClick={()=>setShowPreview(false)}><X/></button></div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {previewData.questions.map((q,i)=>(
                            <div key={q.id} className="border p-4 rounded bg-gray-50 relative group">
                                <button onClick={()=>handleDeleteQuestion(q.id)} className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100"><Trash2/></button>
                                <div className="font-bold text-indigo-700">Soal {i+1} <span className="text-xs bg-gray-200 px-2 rounded text-gray-600">{q.type}</span></div>
                                {q.reading_material && <div className="bg-yellow-50 p-2 text-sm italic my-2 border-l-4 border-yellow-400">{renderText(q.reading_material)}</div>}
                                <div className="my-2">{renderText(q.text)}</div>
                                
                                {q.type === 'table_boolean' ? (
                                    <table className="w-full text-sm border mt-2">
                                        <thead><tr className="bg-gray-200"><th>Pernyataan</th><th>{q.label_true || 'Benar'}</th><th>{q.label_false || 'Salah'}</th></tr></thead>
                                        <tbody>{q.options.map(o=><tr key={o.id} className="border-t"><td className="p-2">{renderText(o.label)}</td><td className="text-center">{o.is_correct?'✓':''}</td><td className="text-center">{!o.is_correct?'✓':''}</td></tr>)}</tbody>
                                    </table>
                                ) : (
                                    <div className="ml-4 space-y-1">{q.options.map((o, idx)=><div key={idx} className={o.is_correct?'text-green-600 font-bold':''}>{String.fromCharCode(65+idx)}. {renderText(o.label)} {o.is_correct&&'(Kunci)'}</div>)}</div>
                                )}
                                {q.explanation && <div className="mt-4 bg-green-100 p-3 rounded text-sm text-green-800"><strong>Pembahasan:</strong> {renderText(q.explanation)}</div>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* DASHBOARD UTAMA */}
        {tab === 'periods' && (
            <div>
                <h2 className="text-2xl font-bold mb-6">Manajemen Soal</h2>
                <div className="bg-white p-6 rounded shadow mb-6">
                    <div className="flex gap-4 items-end">
                        <div className="flex-1"><label className="text-xs font-bold">Nama Periode</label><input className="w-full border p-2 rounded" value={newPeriodName} onChange={e=>setNewPeriodName(e.target.value)}/></div>
                        <div className="w-1/4"><label className="text-xs font-bold">Tipe</label><select className="w-full border p-2 rounded" value={examType} onChange={e=>setExamType(e.target.value)}><option value="UTBK">UTBK</option><option value="CPNS">CPNS</option><option value="UMUM">UMUM</option></select></div>
                        <button onClick={handleCreatePeriod} className="bg-indigo-600 text-white px-4 py-2 rounded font-bold">Buat</button>
                    </div>
                </div>
                <div className="space-y-4">
                    {periods.map(p=>(
                        <div key={p.id} className="bg-white rounded shadow p-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold">{p.name} <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded ml-2">{p.exam_type}</span></h3>
                                <div className="flex gap-2">
                                    <button onClick={()=>togglePeriodActive(p.id, p.is_active)} className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">{p.is_active?'Hide':'Show'}</button>
                                    <button onClick={()=>handleDeletePeriod(p.id)} className="text-red-500"><Trash2 size={16}/></button>
                                    <button onClick={()=>setExpandedPeriod(expandedPeriod===p.id?null:p.id)}>{expandedPeriod===p.id?<ChevronUp/>:<ChevronDown/>}</button>
                                </div>
                            </div>
                            {expandedPeriod===p.id && (
                                <div className="mt-4 border-t pt-4 grid gap-2">
                                    {p.exams.map(e=>(
                                        <div key={e.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <div className="font-bold text-sm">{e.title} <span className="font-normal text-gray-500">({e.questions.length} soal)</span></div>
                                            <div className="flex gap-2">
                                                <button onClick={()=>openManualInput(e.id)} className="bg-teal-600 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1"><PenTool size={12}/> Input Soal</button>
                                                <button onClick={()=>handlePreviewExam(e.id)} className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-xs font-bold">Lihat</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}
      </main>
    </div>
  );
};
export default AdminDashboard;