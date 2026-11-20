import { prisma } from "@/lib/prisma";
import ScoresClient from "./ScoresClient";
import { redirect } from "next/navigation";
import { getAdminTenantContext, buildUserPesantrenWhere } from "@/lib/tenant";
import { buildAttemptRecap, loadExamsWithQuestionsMap } from "@/lib/attemptRecap";

export const dynamic = "force-dynamic";

export default async function AdminScoresPage() {
  const ctx = await getAdminTenantContext();

  if (!ctx) {
    redirect("/login");
  }

  const [users, exams] = await Promise.all([
    prisma.user.findMany({
      where: buildUserPesantrenWhere(ctx, { role: "STUDENT" }),
      select: {
        id: true,
        name: true,
        email: true,
        schoolName: true,
        pesantrenId: true,
        snbpTargetUniv: true,
        snbpTargetMajor: true,
        isApproved: true,
        createdAt: true,
        attempts: {
          include: { exam: { select: { id: true, title: true, type: true } } },
          orderBy: { startTime: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.exam.findMany({
      select: { id: true, title: true, type: true, status: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const attemptExamIds = users.flatMap((u) =>
    u.attempts
      .filter((a) => a.endTime !== null || a.score !== null)
      .map((a) => a.examId)
  );
  const examById = await loadExamsWithQuestionsMap(attemptExamIds);

  const enrichedUsers = users.map((u) => {
    const completed = u.attempts.filter((a) => a.endTime !== null || a.score !== null);
    return {
      id: u.id,
      name: u.name || "Siswa",
      email: u.email || "",
      schoolName: u.schoolName || "",
      pesantrenId: u.pesantrenId || null,
      snbpTargetUniv: u.snbpTargetUniv || "",
      snbpTargetMajor: u.snbpTargetMajor || "",
      isApproved: u.isApproved,
      attempts: completed.map((a) => buildAttemptRecap(a, examById)),
    };
  });

  return (
    <div>
      <ScoresClient
        users={enrichedUsers}
        exams={exams}
        activeScopeName={ctx.activePesantren?.namaPesantren || null}
      />
    </div>
  );
}
