import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getStudentExams } from "@/actions/exam";
import { prisma } from "@/lib/prisma";
import StudentExamsClient from "./StudentExamsClient";

export default async function StudentExamsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return <div>Silakan login.</div>;
  }

  const sp = await searchParams;
  const allowedTypes = (session.user as any).allowedExamTypes || [];
  const pesantrenId = (session.user as any).pesantrenId || null;

  const [exams, announcements] = await Promise.all([
    getStudentExams(allowedTypes, pesantrenId),
    prisma.announcement.findMany({
      orderBy: { publishedAt: "desc" },
      take: 3,
    }),
  ]);

  return (
    <StudentExamsClient
      initialExams={exams}
      allowedTypes={allowedTypes}
      initialQuery={sp?.q || ""}
      announcements={announcements.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
      }))}
    />
  );
}
