import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import LearnClient from "./LearnClient";

export default async function LearnDashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;

  const [materials, progress] = await Promise.all([
    prisma.material.findMany({
      where: { isPublished: true },
      include: {
        chapter: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: [{ chapter: { orderIndex: "asc" } }, { orderIndex: "asc" }],
    }),
    userId
      ? prisma.studentProgress.findMany({
          where: { userId },
          select: { materialId: true },
        })
      : Promise.resolve([]),
  ]);

  const completedIds = progress.map((p) => p.materialId);

  return <LearnClient materials={materials} completedIds={completedIds} />;
}
