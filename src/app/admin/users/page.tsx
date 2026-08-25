import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <UsersClient users={users} />
    </div>
  );
}
