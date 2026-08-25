import { prisma } from "@/lib/prisma";
import LearnClient from "./LearnClient";

export default async function LearnDashboardPage() {
  const materials = await prisma.material.findMany({
    include: { chapter: true },
    orderBy: { orderIndex: "asc" },
  });

  return <LearnClient materials={materials} />;
}
