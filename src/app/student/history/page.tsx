import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import HistoryClient from "./HistoryClient";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;

  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: { exam: true },
    orderBy: { startTime: "desc" },
  });

  const historyData = attempts.map(attempt => {
    // Determine status (mocked for now since grading logic is not yet built)
    const score = attempt.score || 0;
    const targetScore = 700; // Hardcoded target for now
    
    // Parse answers or mock subscores
    let subscores: any[] = [];
    try {
      if (attempt.answers) {
        // Here we would parse and calculate per-subject
        // but since we lack the full CBT engine right now, we use a mock subscore structure
      }
    } catch(e) {}

    // Mock subscores if empty
    if (subscores.length === 0) {
      subscores = [
        { subject: "Penalaran Umum", score: Math.min(1000, score + 20), fullMark: 1000, correct: 22, total: 30 },
        { subject: "Literasi B. Indonesia", score: Math.min(1000, score - 10), fullMark: 1000, correct: 18, total: 30 }
      ];
    }

    return {
      id: attempt.id,
      title: attempt.exam.title,
      date: new Date(attempt.startTime).toLocaleDateString("id-ID", { dateStyle: "long" }),
      score: score,
      targetScore: targetScore,
      status: score >= targetScore ? "LULUS" : "BELUM LULUS",
      category: attempt.exam.type,
      isIRT: true,
      subscores
    };
  });

  return <HistoryClient historyData={historyData} />;
}
