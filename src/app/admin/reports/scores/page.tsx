import { prisma } from "@/lib/prisma";
import ScoresClient from "./ScoresClient";
import { redirect } from "next/navigation";
import { getAdminTenantContext, buildUserPesantrenWhere } from "@/lib/tenant";

export default async function AdminScoresPage() {
  const ctx = await getAdminTenantContext();

  if (!ctx) {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    where: buildUserPesantrenWhere(ctx, { role: "STUDENT" }),
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
