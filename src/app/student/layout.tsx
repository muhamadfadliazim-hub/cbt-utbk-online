import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, PenTool, Target, History, Bell, Search, BookOpen, GraduationCap, Video, User } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import LiveChatWidget from "@/components/student/LiveChatWidget";
import { prisma } from "@/lib/prisma";

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = session.user as any;
  const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : "U";

  // Calculate dynamic progress based on recent SNBT attempts
  const recentAttempts = await prisma.attempt.findMany({
    where: {
      userId: user.id,
      score: { not: null },
      exam: { type: 'SNBT' }
    },
    orderBy: { startTime: 'desc' },
    take: 5
  });

  let progressValue = 0;
  if (recentAttempts.length > 0) {
    const sum = recentAttempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0);
    // Assuming SNBT max IRT score is typically around 1000, 
    // we divide by 10 to get a percentage
    const avgScore = sum / recentAttempts.length;
    progressValue = Math.min(100, Math.max(0, Math.round(avgScore / 10)));
  } else {
    // Fallback: check materials progress
    const materialsDone = await prisma.studentProgress.count({
      where: { userId: user.id }
    });
    // Assuming 20 materials is 100% for now as a baseline
    progressValue = Math.min(100, Math.round((materialsDone / 20) * 100));
  }

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>AZ <span>Student</span></h2>
        <ul className="sidebar-nav">
          <li><Link href="/student"><LayoutDashboard size={20} style={{marginRight: 12}} /> Dasbor Saya</Link></li>
          <li><Link href="/student/learn"><BookOpen size={20} style={{marginRight: 12}} /> Materi Belajar</Link></li>
          <li><Link href="/student/exams"><PenTool size={20} style={{marginRight: 12}} /> Pilihan Ujian</Link></li>
          <li><Link href="/student/live-classes"><Video size={20} style={{marginRight: 12}} /> Live Class (Meet)</Link></li>
          <li><Link href="/student/passing-grade"><GraduationCap size={20} style={{marginRight: 12}} /> Passing Grade Jurusan</Link></li>
          <li><Link href="/student/snbp"><Target size={20} style={{marginRight: 12}} /> Rasionalisasi SNBP</Link></li>
          <li><Link href="/student/history"><History size={20} style={{marginRight: 12}} /> Riwayat Hasil</Link></li>
          <li><Link href="/student/profile"><User size={20} style={{marginRight: 12}} /> Profil & Pengaturan</Link></li>
        </ul>
        <div style={{ position: "absolute", bottom: "30px", left: "20px", right: "20px", background: "var(--surface-hover)", padding: "15px", borderRadius: "1rem", border: "1px solid var(--border)" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--primary)", marginBottom: "10px", fontWeight: "600" }}>Siap SNBT 2027?</p>
          <div style={{ width: "100%", background: "white", height: "8px", borderRadius: "4px" }}>
            <div style={{ width: `${progressValue}%`, background: "var(--accent)", height: "100%", borderRadius: "4px", boxShadow: "0 0 10px rgba(245, 158, 11, 0.5)", transition: "width 0.5s ease-in-out" }}></div>
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", fontWeight: "bold" }}>Progress: {progressValue}%</p>
        </div>
      </aside>
      
      <main className="main-content">
        <header className="dashboard-header" style={{ padding: "0 0 20px 0", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", background: "white", padding: "10px 20px", borderRadius: "20px", border: "1px solid var(--border)", width: "350px", boxShadow: "var(--shadow-sm)" }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: "10px" }} />
            <input type="text" placeholder="Cari tryout, materi, atau jurusan..." style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>

            <div style={{ display: "flex", alignItems: "center", gap: "15px", background: "white", padding: "5px 15px 5px 5px", borderRadius: "30px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "35px", height: "35px", background: "linear-gradient(135deg, var(--accent) 0%, #1E3A8A 100%)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>{initials}</div>
                <span style={{ fontWeight: "600", fontSize: "0.95rem" }}>{user.name}</span>
              </div>
              <div style={{ width: "1px", height: "20px", background: "var(--border)" }}></div>
              <LogoutButton />
            </div>
          </div>
        </header>
        {children}
      </main>
      <LiveChatWidget />
    </div>
  );
}
