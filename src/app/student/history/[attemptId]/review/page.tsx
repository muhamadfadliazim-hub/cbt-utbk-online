import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ReviewClient from "./ReviewClient";
import { parseAnswerKeyValue, parseQuestionOptions } from "@/lib/examGrading";

export default async function ReviewPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) redirect("/login");

  const { attemptId } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      exam: {
        include: {
          sections: {
            orderBy: { orderIndex: "asc" },
            include: {
              questions: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.userId !== (session.user as any).id) {
    redirect("/student/history");
  }

  if (!attempt.exam.showDiscussion) {
    redirect("/student/history");
  }

  let studentAnswers: Record<string, any> = {};
  try {
    if (attempt.answers) studentAnswers = JSON.parse(attempt.answers);
  } catch {}

  const reviewSections = attempt.exam.sections.map((sec) => ({
    id: sec.id,
    title: sec.title,
    questions: sec.questions.map((q) => {
      const { options, statements } = parseQuestionOptions(q.options, q.type);
      return {
        id: q.id,
        type: q.type,
        content: q.content,
        options,
        statements,
        rawOptions: q.options,
        rawAnswerKey: q.answerKey,
        answerKey: parseAnswerKeyValue(q.answerKey),
        explanation: q.explanation || "",
      };
    }),
  }));

  return (
    <ReviewClient
      examTitle={attempt.exam.title}
      allowPdfDownload={attempt.exam.allowPdfDownload}
      sections={reviewSections}
      studentAnswers={studentAnswers}
    />
  );
}
