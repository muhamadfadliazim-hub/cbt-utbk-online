import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function AdminDashboardPage() {
  const studentCount = await prisma.user.count({
    where: { role: "STUDENT" },
  });

  return <DashboardClient studentCount={studentCount} />;
}
