import { prisma } from "@/lib/prisma";
import ScoresClient from "./ScoresClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminScoresPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      attempts: {
        include: { exam: true },
        orderBy: { startTime: "desc" }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <ScoresClient users={users} />
    </div>
  );
}
