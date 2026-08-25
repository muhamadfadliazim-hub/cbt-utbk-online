import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();
    const { examId, examTitle, examType, answers, score, duration } = body;

    // Check if Exam exists in DB
    let exam = await prisma.exam.findUnique({
      where: { id: examId }
    });

    // If exam does not exist, create a stub version of it so foreign keys work
    if (!exam) {
      exam = await prisma.exam.create({
        data: {
          id: examId,
          title: examTitle || "Simulasi CBT",
          description: "Diimpor dari aplikasi mock CBT",
          type: examType || "SNBT", // fallback to SNBT
          status: "PUBLISHED",
          access: "OPEN",
          totalDuration: duration || 120, // Default to 120 minutes if unknown
        }
      });
    }

    // Record the attempt
    const attempt = await prisma.attempt.create({
      data: {
        userId,
        examId: exam.id,
        startTime: new Date(Date.now() - (duration || 0) * 1000), // Approximate start time based on duration elapsed
        endTime: new Date(),
        score: score,
        answers: JSON.stringify(answers),
      }
    });

    return NextResponse.json({ success: true, attemptId: attempt.id, score });
  } catch (error) {
    console.error("Submit Mock Exam Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
