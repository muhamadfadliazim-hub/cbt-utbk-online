import React, { useState, useEffect } from 'react';
import AdminDashboard from './AdminDashboard';
import StudentDashboard from './StudentDashboard';
import { API_URL } from './config';
import { User, Lock, Loader2, GraduationCap, ChevronRight, XCircle } from 'lucide-react';

const App = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('eduprime_user');
        if (saved) { try { setUser(JSON.parse(saved)); } catch (e) { localStorage.removeItem('eduprime_user'); } }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault(); setLoading(true); setError('');
        try {
            const res = await fetch(`${API_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password }) });
            const data = await res.json();
            if (res.ok) { setUser(data); localStorage.setItem('eduprime_user', JSON.stringify(data)); } 
            else { setError(data.detail || "Login gagal."); }
        } catch (err) { setError("Koneksi gagal."); } finally { setLoading(false); }
    };

    const handleLogout = () => { 
        if(window.confirm("Yakin ingin keluar?")) { setUser(null); localStorage.removeItem('eduprime_user'); window.location.reload(); }
    };

    if (user) {
        if (user.role === 'admin') return <AdminDashboard onLogout={handleLogout} />;
        return <StudentDashboard user={user} onLogout={handleLogout} />;
    }

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
                <div className="text-center mb-8">
                    <div className="inline-flex p-4 bg-indigo-600 rounded-2xl mb-4 text-white shadow"><GraduationCap size={32} /></div>
                    <h1 className="text-3xl font-black text-slate-800">Edu<span className="text-indigo-600">Prime</span></h1>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    {error && <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2"><XCircle size={16}/>{error}</div>}
                    <div className="relative"><User className="absolute left-4 top-3.5 text-slate-400" size={18}/><input className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border font-bold text-sm focus:border-indigo-500 outline-none" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} autoFocus/></div>
                    <div className="relative"><Lock className="absolute left-4 top-3.5 text-slate-400" size={18}/><input type="password" className="w-full pl-12 pr-4 py-3 bg-slate-50 rounded-xl border font-bold text-sm focus:border-indigo-500 outline-none" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)}/></div>
                    <button type="submit" disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm flex justify-center gap-2 mt-4 hover:scale-[1.02] transition-transform">{loading ? <Loader2 className="animate-spin"/> : "MASUK"} {!loading && <ChevronRight/>}</button>
                </form>
            </div>
        </div>
    );
};
export default App;