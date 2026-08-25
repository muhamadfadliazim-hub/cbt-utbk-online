import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { Video, Calendar, Link as LinkIcon, Info } from "lucide-react";
import Link from "next/link";

export default async function StudentLiveClassesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  // Fetch the user to get their schoolName
  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { schoolName: true }
  });

  // Fetch upcoming and active classes
  const orConditions: any[] = [{ targetSchool: null, targetUserEmail: null }];
  
  if (user?.schoolName) {
    orConditions.push({ targetSchool: user.schoolName });
  }
  
  if (session.user.email) {
    orConditions.push({ targetUserEmail: session.user.email });
  }

  const classes = await prisma.liveClass.findMany({
    where: { 
      isActive: true,
      OR: orConditions
    },
    orderBy: { scheduledAt: 'asc' }
  });

  return (
    <div style={{ padding: "30px", maxWidth: "1000px", background: "white", borderRadius: "20px", boxShadow: "var(--shadow-md)" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "10px", display: "flex", alignItems: "center", gap: "10px", color: "var(--text)" }}>
        <Video color="var(--primary)" /> Jadwal Kelas Live
      </h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>
        Ikuti sesi tatap muka interaktif bersama pengajar langsung dari layar Anda.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {classes.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", background: "white", borderRadius: "12px", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
            Belum ada jadwal kelas yang akan datang.
          </div>
        ) : (
          classes.map(c => {
            const isStarted = new Date(c.scheduledAt).getTime() <= new Date().getTime();
            return (
              <div key={c.id} style={{ background: "white", padding: "20px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
                <div>
                  <h3 style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "8px" }}>{c.title}</h3>
                  <p style={{ fontSize: "0.95rem", color: "var(--text)", marginBottom: "12px" }}>{c.description}</p>
                  <div style={{ display: "flex", gap: "20px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px" }}><Calendar size={14}/> {new Date(c.scheduledAt).toLocaleString("id-ID")}</span>
                  </div>
                </div>
                <div>
                  {isStarted ? (
                    <Link href={`/student/live-classes/${c.id}/join`} style={{ padding: "12px 25px", background: "var(--primary)", color: "white", textDecoration: "none", borderRadius: "25px", fontWeight: "bold", display: "inline-block", boxShadow: "var(--shadow-md)" }}>
                      Gabung Kelas Sekarang
                    </Link>
                  ) : (
                    <div style={{ padding: "10px 20px", background: "var(--surface)", color: "var(--text-muted)", borderRadius: "20px", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "5px" }}>
                      <Info size={16} /> Belum Mulai
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
