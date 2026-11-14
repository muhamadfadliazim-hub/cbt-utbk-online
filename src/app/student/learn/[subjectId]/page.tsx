import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SubjectLearnClient from "./SubjectLearnClient";

export default async function SubjectLearnPage({
  params,
  searchParams,
}: {
  params: Promise<{ subjectId: string }>;
  searchParams: Promise<{ material?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/login");
  }

  const { subjectId } = await params;
  const sp = await searchParams;
  const userId = (session.user as any).id;

  const subject = await prisma.subject.findUnique({
    where: { id: subjectId },
    include: {
      chapters: {
        orderBy: { orderIndex: "asc" },
        include: {
          materials: {
            where: { isPublished: true },
            orderBy: { orderIndex: "asc" },
          },
        },
      },
    },
  });

  if (!subject) {
    redirect("/student/learn");
  }

  const progress = await prisma.studentProgress.findMany({
    where: { userId },
    select: { materialId: true },
  });

  return (
    <SubjectLearnClient
      subjectTitle={subject.title}
      subjectDescription={subject.description || ""}
      chapters={subject.chapters.map((ch) => ({
        id: ch.id,
        title: ch.title,
        materials: ch.materials.map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          url: m.url,
          description: m.description || "",
          duration: m.duration || 15,
        })),
      }))}
      initialCompletedIds={progress.map((p) => p.materialId)}
      initialMaterialId={sp?.material || null}
    />
  );
}
