import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";
import { getAdminTenantContext, buildUserPesantrenWhere } from "@/lib/tenant";
import { getAdminExams } from "@/actions/exam";
import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  const ctx = await getAdminTenantContext();
  if (!ctx) redirect("/login");

  const [studentCount, exams, announcements, materialCount, attemptCount] = await Promise.all([
    prisma.user.count({
      where: buildUserPesantrenWhere(ctx, { role: "STUDENT" }),
    }),
    getAdminExams(),
    prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
      take: 10,
    }),
    prisma.material.count({ where: { isPublished: true } }),
    prisma.attempt.count({
      where: ctx.activePesantrenId
        ? { user: { pesantrenId: ctx.activePesantrenId } }
        : undefined,
    }),
  ]);

  const totalQuestions = exams.reduce((sum, exam) => sum + (exam.questionCount || 0), 0);
  const publishedExams = exams.filter((exam) => exam.status === "PUBLISHED").length;

  return (
    <DashboardClient
      studentCount={studentCount}
      publishedExams={publishedExams}
      totalQuestions={totalQuestions}
      publishedMaterials={materialCount}
      attemptCount={attemptCount}
      initialExams={exams}
      initialAnnouncements={announcements.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        audience: a.audience || "ALL",
        priority: a.priority,
        publishedAt: a.publishedAt.toISOString(),
      }))}
    />
  );
}
