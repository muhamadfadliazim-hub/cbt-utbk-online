import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import ExamTakingClient from "@/components/student/ExamTakingClient";

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const { id } = await params;
  const userId = (session.user as any).id;
  const examId = id;

  // Fetch exam with its sections and questions
  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      sections: {
        orderBy: { orderIndex: 'asc' },
        include: {
          questions: true
        }
      }
    }
  });

  if (!exam) {
    return <div>Ujian tidak ditemukan.</div>;
  }

  // Create a new attempt record when they start
  const attempt = await prisma.attempt.create({
    data: {
      userId,
      examId,
      answers: "{}",
    }
  });

  return (
    <div style={{ padding: "20px", height: "100vh", background: "#f8fafc" }}>
      <ExamTakingClient exam={exam} attemptId={attempt.id} />
    </div>
  );
}
