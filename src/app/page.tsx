"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { 
  Lock, Mail, ChevronRight, GraduationCap, 
  Target, Lightbulb, Atom, Users,
  Award, Zap
} from "lucide-react";
import Link from "next/link";

export default function Home() {
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
      router.push('/student');
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      backgroundColor: "var(--background)",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      
      {/* Container to handle responsive flex direction */}
      <div style={{
        display: "flex",
        flexDirection: "row",
        width: "100%",
        flexWrap: "wrap",
        zIndex: 10
      }}>
        
        {/* Left Side: Profile Information */}
        <div style={{
          flex: "1 1 50%",
          padding: "4rem",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          position: "relative",
          minWidth: "350px"
        }}>
          {/* Decorative Elements */}
          <div style={{ position: "absolute", top: "10%", left: "5%", width: "150px", height: "150px", background: "rgba(14, 165, 233, 0.15)", borderRadius: "50%", filter: "blur(40px)" }}></div>
          <div style={{ position: "absolute", bottom: "10%", right: "10%", width: "200px", height: "200px", background: "rgba(245, 158, 11, 0.15)", borderRadius: "50%", filter: "blur(60px)" }}></div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", zIndex: 1 }}>
            <div style={{ width: "64px", height: "64px", background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)", borderRadius: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 10px 25px -5px rgba(14, 165, 233, 0.4)" }}>
              <GraduationCap size={36} color="white" strokeWidth={2.5} />
            </div>
            <h1 style={{ fontSize: "2.5rem", color: "var(--primary)", fontWeight: "800", margin: 0, fontFamily: "'Outfit', sans-serif" }}>
              AZ Academy
            </h1>
          </div>

          <h2 style={{ fontSize: "3rem", color: "var(--text)", fontWeight: "800", lineHeight: "1.2", marginBottom: "1.5rem", fontFamily: "'Outfit', sans-serif", zIndex: 1 }}>
            Langkah Pasti Menuju <span style={{ color: "var(--accent)" }}>PTN Impianmu!</span>
          </h2>
          
          <p style={{ fontSize: "1.15rem", color: "var(--text-muted)", marginBottom: "3rem", maxWidth: "600px", lineHeight: "1.6", zIndex: 1 }}>
            Bergabung dengan ribuan siswa lainnya di platform bimbingan belajar dan tryout UTBK paling mutakhir. Kami menyediakan soal ter-update, pembahasan mendalam, dan analisis progres belajar yang akurat.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", zIndex: 1 }}>
            <div className="feature-item" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ background: "#E0F2FE", padding: "0.8rem", borderRadius: "0.8rem", color: "var(--primary)" }}>
                <Target size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "0.25rem", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>Fokus UTBK & SNBT</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.4" }}>Materi dan sistem dirancang khusus menyerupai ujian aslinya.</p>
              </div>
            </div>

            <div className="feature-item" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ background: "#FEF3C7", padding: "0.8rem", borderRadius: "0.8rem", color: "var(--accent)" }}>
                <Zap size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "0.25rem", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>Pembahasan Kilat</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.4" }}>Tersedia pembahasan teks sesaat setelah ujian usai.</p>
              </div>
            </div>

            <div className="feature-item" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ background: "#D1FAE5", padding: "0.8rem", borderRadius: "0.8rem", color: "var(--success)" }}>
                <Users size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "0.25rem", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>Komunitas Belajar</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.4" }}>Forum diskusi eksklusif bersama tentor dan siswa se-Indonesia.</p>
              </div>
            </div>

            <div className="feature-item" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{ background: "#F3E8FF", padding: "0.8rem", borderRadius: "0.8rem", color: "#9333EA" }}>
                <Award size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text)", marginBottom: "0.25rem", fontWeight: "700", fontFamily: "'Outfit', sans-serif" }}>Tutor Berpengalaman</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.4" }}>Dibimbing langsung oleh para pengajar lulusan PTN terbaik.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div style={{
          flex: "1 1 40%",
          background: "linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          position: "relative",
          minWidth: "350px",
          boxShadow: "-10px 0 25px -10px rgba(0,0,0,0.15)"
        }}>
          {/* Floating Icons for Playful Vibe */}
          <div style={{ position: "absolute", top: "15%", right: "15%", opacity: 0.7, transform: "rotate(15deg)", animation: "float 6s ease-in-out infinite" }}>
            <Atom size={64} color="rgba(255,255,255,0.3)" strokeWidth={1.5} />
          </div>
          <div style={{ position: "absolute", bottom: "15%", left: "10%", opacity: 0.7, transform: "rotate(-10deg)", animation: "float 8s ease-in-out infinite" }}>
            <Lightbulb size={72} color="rgba(255,255,255,0.25)" strokeWidth={1.5} />
          </div>

          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            background: "white", 
            borderRadius: "2rem", 
            overflow: "hidden", 
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.35)", 
            maxWidth: "450px", 
            width: "100%", 
            padding: "3rem 2.5rem", 
            position: "relative",
            zIndex: 10
          }}>
            
            <div style={{ textAlign: "center", marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1.8rem", color: "var(--text)", fontWeight: "800", marginBottom: "0.5rem", fontFamily: "'Outfit', sans-serif" }}>Masuk ke Akun</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "1rem" }}>Lanjutkan belajarmu hari ini</p>
            </div>

            {error && (
              <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "12px", borderRadius: "0.8rem", marginBottom: "1rem", textAlign: "center", fontWeight: "600", fontSize: "0.95rem" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              
              <div style={{ position: "relative" }}>
                <Mail size={20} color="var(--primary-light)" style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }} />
                <input type="email" placeholder="Alamat Email..." required value={username} onChange={e => setUsername(e.target.value)} style={{ width: "100%", padding: "16px 15px 16px 50px", borderRadius: "1rem", border: "2px solid #E0F2FE", fontSize: "1rem", outlineColor: "var(--primary)", background: "var(--background)", color: "var(--text)", fontWeight: "500", boxSizing: "border-box" }} />
              </div>

              <div style={{ position: "relative" }}>
                <Lock size={20} color="var(--primary-light)" style={{ position: "absolute", left: "18px", top: "50%", transform: "translateY(-50%)" }} />
                <input type="password" placeholder="Kata Sandi..." required value={password} onChange={e => setPassword(e.target.value)} style={{ width: "100%", padding: "16px 15px 16px 50px", borderRadius: "1rem", border: "2px solid #E0F2FE", fontSize: "1rem", outlineColor: "var(--primary)", background: "var(--background)", color: "var(--text)", fontWeight: "500", boxSizing: "border-box" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
                <a href="#" style={{ color: "var(--accent)", fontSize: "0.9rem", fontWeight: "700" }}>Lupa Kata Sandi?</a>
              </div>

              <button type="submit" disabled={isLoading} className="btn" style={{ background: "var(--accent)", color: "white", padding: "16px", fontSize: "1.1rem", borderRadius: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", fontWeight: "800", border: "none", boxShadow: "0 10px 25px -5px rgba(245, 158, 11, 0.4)", cursor: "pointer", transition: "all 0.2s" }}>
                {isLoading ? "Memproses..." : <>Masuk Sekarang <ChevronRight size={22} strokeWidth={3} /></>}
              </button>
              
              <div style={{ display: "flex", alignItems: "center", gap: "15px", margin: "10px 0" }}>
                <div style={{ height: "1px", background: "var(--border)", flex: 1 }}></div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: "bold" }}>ATAU</span>
                <div style={{ height: "1px", background: "var(--border)", flex: 1 }}></div>
              </div>

              <button type="button" onClick={() => signIn("google", { callbackUrl: "/student" })} style={{ background: "white", color: "var(--text)", padding: "14px", fontSize: "1rem", borderRadius: "1rem", display: "flex", justifyContent: "center", alignItems: "center", gap: "12px", fontWeight: "700", border: "2px solid #E2E8F0", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                <svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/></g></svg>
                Masuk dengan Google
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* Global CSS for floating animation & responsive adjustments */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @media (max-width: 900px) {
          .feature-item {
            align-items: center !important;
          }
        }
      `}} />
    </div>
  );
}
