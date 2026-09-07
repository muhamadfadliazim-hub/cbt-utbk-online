import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReviewClient from "./ReviewClient";

export default async function ReviewPage({ params }: { params: { attemptId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect('/login');

  const attempt = await prisma.attempt.findUnique({
    where: { id: params.attemptId },
    include: { exam: true },
  });

  if (!attempt || attempt.userId !== (session.user as any).id) {
    redirect('/student/history');
  }

  if (!attempt.exam.showDiscussion) {
    redirect('/student/history'); // Block access if discussion not allowed
  }

  let studentAnswers = {};
  try {
    if (attempt.answers) studentAnswers = JSON.parse(attempt.answers);
  } catch (e) {}

  return (
    <ReviewClient 
      examId={attempt.exam.id} 
      examTitle={attempt.exam.title} 
      allowPdfDownload={attempt.exam.allowPdfDownload} 
      studentAnswers={studentAnswers} 
    />
  );
}
