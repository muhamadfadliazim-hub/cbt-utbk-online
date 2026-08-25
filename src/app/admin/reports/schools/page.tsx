import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Users, GraduationCap, TrendingUp, Building } from "lucide-react";

export default async function SchoolReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect('/login');
  }

  // Fetch all users with their attempts
  const users = await prisma.user.findMany({
    where: { role: 'STUDENT', schoolName: { not: null } },
    select: {
      id: true,
      name: true,
      schoolName: true,
      isApproved: true,
      attempts: {
        where: { score: { not: null } },
        select: { score: true }
      }
    }
  });

  // Aggregate by school
  const schoolStats: Record<string, { totalStudents: number, eligibleCount: number, sumScores: number, totalAttempts: number }> = {};
  
  users.forEach(u => {
    const school = u.schoolName || "Unknown";
    if (!schoolStats[school]) {
      schoolStats[school] = { totalStudents: 0, eligibleCount: 0, sumScores: 0, totalAttempts: 0 };
    }
    
    schoolStats[school].totalStudents++;
    if (u.isApproved) schoolStats[school].eligibleCount++;
    
    u.attempts.forEach(a => {
      schoolStats[school].sumScores += (a.score || 0);
      schoolStats[school].totalAttempts++;
    });
  });

  const sortedSchools = Object.entries(schoolStats).map(([name, stats]) => ({
    name,
    ...stats,
    averageScore: stats.totalAttempts > 0 ? (stats.sumScores / stats.totalAttempts).toFixed(2) : "0.00"
  })).sort((a, b) => b.totalStudents - a.totalStudents);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "1.8rem", color: "white", fontWeight: "bold", marginBottom: "10px" }}>Rekapitulasi Siswa Per Sekolah</h1>
      <p style={{ color: "rgba(255, 255, 255, 0.9)", marginBottom: "30px" }}>Statistik agregat berdasarkan sekolah asal siswa yang terdaftar.</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: "20px" }}>
        {sortedSchools.map((school, idx) => (
          <div key={idx} style={{ background: "white", borderRadius: "12px", border: "1px solid var(--border)", overflow: "hidden", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ padding: "15px 20px", background: "var(--surface)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "10px" }}>
              <Building size={20} color="var(--primary)" />
              <h3 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "var(--text)" }}>{school.name}</h3>
            </div>
            
            <div style={{ padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}><Users size={16}/> Total Siswa</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{school.totalStudents}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}><GraduationCap size={16}/> Eligible SNBP</span>
                <span style={{ fontSize: "1.5rem", fontWeight: "bold", color: "var(--success)" }}>{school.eligibleCount}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px", gridColumn: "1 / -1", marginTop: "10px", padding: "15px", background: "#f8fafc", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "5px" }}><TrendingUp size={16} color="var(--accent)"/> Rata-rata Skor Tryout</span>
                <span style={{ fontSize: "1.8rem", fontWeight: "bold", color: "var(--accent)" }}>{school.averageScore}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Dari {school.totalAttempts} pengerjaan ujian</span>
              </div>
            </div>
          </div>
        ))}
        {sortedSchools.length === 0 && (
          <div style={{ gridColumn: "1 / -1", padding: "40px", textAlign: "center", color: "var(--text-muted)", background: "white", borderRadius: "12px", border: "1px solid var(--border)" }}>
            Belum ada data siswa yang mencantumkan nama sekolah.
          </div>
        )}
      </div>
    </div>
  );
}
