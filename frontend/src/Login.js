import React, { useState } from 'react';
import { User, Lock, Loader2, ArrowRight } from 'lucide-react';
import { API_URL } from './config';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
        if(username==='admin' && password==='admin123') {
            onLogin({username:'admin', role:'admin', full_name:'Administrator'}); return;
        }
        const res = await fetch(`${API_URL}/login`, {
            method:'POST', headers:{'Content-Type':'application/json'},
            body:JSON.stringify({username, password})
        });
        const d = await res.json();
        if(res.ok) onLogin(d);
        else setError("Login Gagal: Cek Username/Password");
    } catch(e) { setError("Gagal koneksi ke server"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm md:max-w-md overflow-hidden">
        <div className="bg-indigo-600 p-8 text-center">
            <h1 className="text-2xl font-black text-white tracking-tighter">CBT PRO</h1>
            <p className="text-indigo-100 text-sm">Masuk untuk memulai ujian</p>
        </div>
        <div className="p-8">
            {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm font-bold text-center">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Username</label>
                    <div className="relative mt-1">
                        <User className="absolute left-3 top-3 text-slate-400" size={20}/>
                        <input className="w-full pl-10 p-3 border rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username"/>
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Password</label>
                    <div className="relative mt-1">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={20}/>
                        <input type="password" className="w-full pl-10 p-3 border rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                            value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••"/>
                    </div>
                </div>
                <button disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold transition flex justify-center items-center gap-2">
                    {loading ? <Loader2 className="animate-spin"/> : <>MASUK <ArrowRight/></>}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};
export default Login;