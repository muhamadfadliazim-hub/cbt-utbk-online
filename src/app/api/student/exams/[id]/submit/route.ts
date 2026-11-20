import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { scoreExamAttempt } from "@/lib/examGrading";
import { syncBaznasSantriForUser } from "@/lib/baznasSync";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { attemptId, answers } = body;

    const exam = await prisma.exam.findUnique({
      where: { id: id },
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
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    const graded = scoreExamAttempt(exam.sections, answers || {}, exam.type);

    const updatedAttempt = await prisma.attempt.update({
      where: { id: attemptId },
      data: {
        endTime: new Date(),
        answers: JSON.stringify(answers || {}),
        score: graded.score,
      },
      select: { userId: true },
    });

    try {
      await syncBaznasSantriForUser(updatedAttempt.userId);
    } catch (syncError) {
      console.error("Non-fatal BAZNAS TO sync error:", syncError);
    }

    return NextResponse.json({
      success: true,
      score: graded.score,
      isIRT: graded.isIRT,
      scaleMax: graded.scaleMax,
    });
  } catch (error) {
    console.error("Submit Exam Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
