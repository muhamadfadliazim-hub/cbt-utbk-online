"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ChevronRight, GraduationCap, Target, Lightbulb, Atom, BookOpen, User } from "lucide-react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    const res = await signIn("credentials", {
      email: username,
      password,
      redirect: false,
    });
    
    setIsLoading(false);

    if (res?.error) {
      setError("Email atau kata sandi salah.");
    } else if (res?.ok) {
      // The middleware handles routing admins to /admin automatically
      router.push('/student');
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center", 
      background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)", // Matches dashboard banner
      padding: "20px",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Decorative Floating Shapes to make it "rame" */}
      <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "300px", height: "300px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(40px)" }}></div>
      <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "400px", height: "400px", background: "rgba(245, 158, 11, 0.2)", borderRadius: "50%", filter: "blur(60px)" }}></div>
      
      {/* Floating Lucide Icons */}
      <div style={{ position: "absolute", top: "15%", right: "15%", opacity: 0.7, transform: "rotate(15deg)", animation: "float 6s ease-in-out infinite" }}>
        <Atom size={64} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
      </div>
      <div style={{ position: "absolute", bottom: "15%", left: "10%", opacity: 0.7, transform: "rotate(-10deg)", animation: "float 8s ease-in-out infinite" }}>
        <Lightbulb size={72} color="rgba(255,255,255,0.5)" strokeWidth={1.5} />
      </div>
      <div style={{ position: "absolute", top: "40%", left: "8%", opacity: 0.5, animation: "float 7s ease-in-out infinite reverse" }}>
        <Target size={56} color="rgba(245, 158, 11, 0.6)" strokeWidth={2} />
      </div>
      <div style={{ position: "absolute", bottom: "25%", right: "12%", opacity: 0.6, animation: "float 5s ease-in-out infinite" }}>
        <BookOpen size={60} color="rgba(255,255,255,0.6)" strokeWidth={1.5} />
      </div>

      {/* Login Card */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        background: "white", 
        borderRadius: "2rem", 
        overflow: "hidden", 
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", 
        maxWidth: "450px", 
        width: "100%", 
        padding: "3rem 2.5rem", 
        position: "relative",
        zIndex: 10
      }}>
        
        {/* Playful Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ width: "80px", height: "80px", background: "var(--background)", borderRadius: "1.5rem", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem", boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.3)", border: "2px solid #E0F2FE" }}>
            <GraduationCap size={44} color="var(--primary)" strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: "2.2rem", color: "var(--primary)", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontWeight: "800" }}>
            AZ Academy
          </h1>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", fontSize: "1.05rem" }}>Portal Belajar & Tryout No.1</p>
        </div>

        {/* Form */}
        {error && (
          <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px", borderRadius: "8px", marginBottom: "15px", textAlign: "center", fontWeight: "bold" }}>
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
          
          <div style={{ position: "relative", marginTop: "0.5rem" }}>
            <Mail size={22} color="var(--primary-light)" style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }} />
            <input type="email" placeholder="Alamat Email..." required value={username} onChange={e => setUsername(e.target.value)} style={{ width: "100%", padding: "16px 15px 16px 50px", borderRadius: "1rem", border: "2px solid #E0F2FE", fontSize: "1.05rem", outlineColor: "var(--primary)", background: "var(--background)", color: "var(--text)", fontWeight: "500" }} />
          </div>

          <div style={{ position: "relative" }}>
            <Lock size={22} color="var(--primary-light)" style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }} />
            <input type="password" placeholder="Kata Sandi..." required value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "16px 15px 16px 50px", borderRadius: "1rem", border: "2px solid #E0F2FE", fontSize: "1.05rem", outlineColor: "var(--primary)", background: "var(--background)", color: "var(--text)", fontWeight: "500" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
            <a href="#" style={{ color: "var(--accent)", fontSize: "0.95rem", fontWeight: "700" }}>Lupa Kata Sandi?</a>
          </div>

          <button type="submit" disabled={isLoading} className="btn" style={{ background: "var(--accent)", color: "white", padding: "18px", fontSize: "1.15rem", borderRadius: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontWeight: "800", border: "none", boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.5)", cursor: "pointer", transition: "all 0.2s" }}>
            {isLoading ? "Masuk ke Sistem..." : <>Masuk dengan Email <ChevronRight size={24} strokeWidth={3} /></>}
          </button>
          
          <div style={{ display: "flex", alignItems: "center", gap: "15px", margin: "10px 0" }}>
            <div style={{ height: "1px", background: "var(--border)", flex: 1 }}></div>
            <span style={{ color: "var(--text-muted)", fontSize: "0.9rem", fontWeight: "bold" }}>ATAU</span>
            <div style={{ height: "1px", background: "var(--border)", flex: 1 }}></div>
          </div>

          <button type="button" onClick={() => signIn("google", { callbackUrl: "/student" })} style={{ background: "white", color: "var(--text)", padding: "15px", fontSize: "1.1rem", borderRadius: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "15px", fontWeight: "700", border: "2px solid #E2E8F0", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
            Masuk dengan Akun Google
          </button>

        </form>
      </div>

      {/* Global CSS for floating animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
      `}} />
    </div>
  );
}
