import { getExamForCbt } from "@/actions/exam";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import CBTEngineClient from "./CBTEngineClient";
import { redirect } from "next/navigation";
import { parseQuestionOptions } from "@/lib/examGrading";

export default async function CBTPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/student/login");
  }

  const userId = (session.user as any).id;
  const [res, dbUser] = await Promise.all([
    getExamForCbt(examId),
    prisma.user.findUnique({
      where: { id: userId },
      select: { snbpTargetUniv: true, snbpTargetMajor: true },
    }),
  ]);

  if (res.error || !res.exam) {
    return <div style={{ padding: "2rem" }}>{res.error || "Ujian tidak ditemukan"}</div>;
  }

  const cbtSections = res.exam.sections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    duration: section.durationSeconds ?? section.durationMinutes * 60,
    questions: section.questions.map((q) => {
      const { options, statements } = parseQuestionOptions(q.options, q.type);
      return {
        id: q.id,
        type: q.type,
        content: q.content,
        options,
        statements,
      };
    }),
  }));

  return (
    <CBTEngineClient
      examId={examId}
      userId={userId}
      initialExam={{
        id: res.exam.id,
        title: res.exam.title,
        description: res.exam.description,
        category: res.exam.type,
        durationMinutes: res.exam.totalDuration,
        showScore: res.exam.showScore,
        showDiscussion: res.exam.showDiscussion,
        continuousFlow: Boolean(res.exam.continuousFlow),
        allowEarlyFinish: Boolean(res.exam.allowEarlyFinish),
      }}
      initialSections={cbtSections}
      studentProfile={{
        targetUniv: dbUser?.snbpTargetUniv || undefined,
        targetMajor: dbUser?.snbpTargetMajor || (session.user as any).targetMajor || undefined,
      }}
    />
  );
}
