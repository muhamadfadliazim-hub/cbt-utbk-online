import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = (session.user as any).id;
    const body = await req.json();
    const { attemptId, answers } = body;

    // Fetch the exam questions to calculate score
    const exam = await prisma.exam.findUnique({
      where: { id: id },
      include: {
        sections: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Basic scoring logic: 10 points per correct answer (can be swapped for IRT later)
    let correctCount = 0;
    const allQuestions = exam.sections.flatMap(s => s.questions);
    
    allQuestions.forEach(q => {
      const studentAnswer = answers[q.id];
      // Note: In real IRT or standard scoring, checking answerKey needs string matching
      if (studentAnswer && studentAnswer === q.answerKey) {
        correctCount++;
      }
    });

    const score = (correctCount / Math.max(1, allQuestions.length)) * 1000; // Map to 1000 point scale

    await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        endTime: new Date(),
        answers: JSON.stringify(answers),
        score: score,
      }
    });

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error("Submit Exam Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
