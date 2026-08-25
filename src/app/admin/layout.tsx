import Link from "next/link";
import { ReactNode } from "react";
import { LayoutDashboard, PenTool, BookPlus, Users, Database, BarChart3, Bell, Search, Video, Megaphone } from "lucide-react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  const user = session.user as any;
  const initials = user.name ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : "A";

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <h2>AZ <span>Admin</span></h2>
        <ul className="sidebar-nav">
          <li><Link href="/admin"><LayoutDashboard size={20} style={{marginRight: 12}} /> Dasbor Admin</Link></li>
          <li><Link href="/admin/exams"><PenTool size={20} style={{marginRight: 12}} /> Manajemen Ujian</Link></li>
          <li><Link href="/admin/live-classes"><Video size={20} style={{marginRight: 12}} /> Live Class (Meet)</Link></li>
          <li><Link href="/admin/broadcast"><Megaphone size={20} style={{marginRight: 12}} /> Live Broadcast</Link></li>
          <li><Link href="/admin/exams/questions"><Database size={20} style={{marginRight: 12}} /> Input Bank Soal</Link></li>
          <li><Link href="/admin/materials"><BookPlus size={20} style={{marginRight: 12}} /> Tambah Materi</Link></li>
          <li><Link href="/admin/users"><Users size={20} style={{marginRight: 12}} /> Manajemen Pengguna</Link></li>
          <li><Link href="/admin/reports/scores"><BarChart3 size={20} style={{marginRight: 12}} /> Laporan & Analitik</Link></li>
          <li><Link href="/admin/data/import"><Database size={20} style={{marginRight: 12}} /> Data Passing Grade</Link></li>
        </ul>
      </aside>
      <main className="main-content">
        <header className="dashboard-header" style={{ padding: "0 0 20px 0", marginBottom: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", background: "white", padding: "10px 20px", borderRadius: "20px", border: "1px solid var(--border)", width: "350px", boxShadow: "var(--shadow-sm)" }}>
            <Search size={18} color="var(--text-muted)" style={{ marginRight: "10px" }} />
            <input type="text" placeholder="Cari soal atau data siswa..." style={{ border: "none", outline: "none", width: "100%", background: "transparent" }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "15px", background: "white", padding: "5px 15px 5px 5px", borderRadius: "30px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "35px", height: "35px", background: "var(--primary)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold" }}>{initials}</div>
                <span style={{ fontWeight: "600", fontSize: "0.95rem", color: "var(--text)" }}>{user.name || "Administrator"}</span>
              </div>
              <div style={{ width: "1px", height: "20px", background: "var(--border)" }}></div>
              <LogoutButton />
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
