import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import BulkImportQuestions from "@/components/admin/BulkImportQuestions";

export default async function BulkImportPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "ADMIN") {
    redirect('/login');
  }

  // Fetch all sections across all exams to let admin select destination
  const sections = await prisma.section.findMany({
    include: {
      exam: {
        select: { title: true }
      }
    },
    orderBy: {
      exam: { createdAt: 'desc' }
    }
  });

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: "10px" }}>Import Soal Massal</h1>
      <p style={{ color: "var(--text-muted)", marginBottom: "30px" }}>Paste teks soal dari Word/PDF untuk otomatis mengubahnya menjadi database soal interaktif.</p>
      
      <BulkImportQuestions sections={sections} />
    </div>
  );
}
