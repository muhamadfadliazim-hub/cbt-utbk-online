import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function StudentDashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const userId = (session.user as any).id;
  const firstName = session.user.name ? session.user.name.split(" ")[0] : "Siswa";

  // Fetch User for SNBP target
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { snbpTargetUniv: true, snbpTargetMajor: true }
  });

  // Fetch Attempts for Chart Data
  const attempts = await prisma.attempt.findMany({
    where: { userId },
    include: { exam: true },
    orderBy: { startTime: "asc" },
  });

  const totalExams = attempts.length;
  let averageScore = 0;
  const chartData: { name: string; score: number }[] = [];

  if (totalExams > 0) {
    const totalScore = attempts.reduce((acc, attempt) => acc + (attempt.score || 0), 0);
    averageScore = totalScore / totalExams;

    attempts.forEach((attempt, i) => {
      chartData.push({
        name: `TO ${i + 1}`,
        score: Math.round(attempt.score || 0)
      });
    });
  }

  // Fetch Next Exam
  const nextExam = await prisma.exam.findFirst({
    where: { status: "PUBLISHED" },
    orderBy: { scheduledAt: "asc" },
    select: { id: true, title: true, scheduledAt: true, totalDuration: true }
  });

  return (
    <DashboardClient 
      firstName={firstName}
      snbpTargetUniv={user?.snbpTargetUniv || null}
      snbpTargetMajor={user?.snbpTargetMajor || null}
      averageScore={averageScore}
      totalExams={totalExams}
      chartData={chartData}
      nextExam={nextExam}
    />
  );
}
