import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { scoreExamAttempt } from "@/lib/examGrading";
import { ensureSessionUser } from "@/lib/sessionUser";
import { syncBaznasSantriForUser } from "@/lib/baznasSync";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { examId, answers, durationSeconds, duration } = body;

    if (!examId || typeof examId !== "string") {
      return NextResponse.json({ error: "examId wajib diisi." }, { status: 400 });
    }

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
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
      return NextResponse.json({ error: "Paket ujian tidak ditemukan di database." }, { status: 404 });
    }

    const graded = scoreExamAttempt(exam.sections, answers || {}, exam.type);
    const targetUserId = await ensureSessionUser(session);

    const elapsedMs = typeof durationSeconds === "number" && durationSeconds > 0
      ? durationSeconds * 1000
      : (typeof duration === "number" && duration > 0 ? duration * 60 * 1000 : 0);

    const attempt = await prisma.attempt.create({
      data: {
        userId: targetUserId,
        examId: exam.id,
        startTime: new Date(Date.now() - elapsedMs),
        endTime: new Date(),
        score: graded.score,
        answers: JSON.stringify(answers || {}),
      },
    });

    try {
      await syncBaznasSantriForUser(targetUserId);
    } catch (syncError) {
      console.error("Non-fatal BAZNAS TO sync error:", syncError);
    }

    return NextResponse.json({
      success: true,
      attemptId: attempt.id,
      category: exam.type,
      isIRT: graded.isIRT,
      showScore: exam.showScore,
      showDiscussion: exam.showDiscussion,
      score: exam.showScore ? graded.score : null,
      correctCount: exam.showDiscussion ? graded.correctCount : null,
      totalQuestions: graded.totalQuestions,
      subscores: (exam.showScore || exam.showDiscussion)
        ? graded.subscores.map((s) => ({
            subject: s.subject,
            score: exam.showScore ? s.score : null,
            fullMark: s.fullMark,
            correct: exam.showDiscussion ? s.correct : null,
            total: s.total,
          }))
        : [],
    });
  } catch (error) {
    console.error("Submit Exam Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

