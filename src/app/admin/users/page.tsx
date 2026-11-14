import { prisma } from "@/lib/prisma";
import UsersClient from "./UsersClient";
import { redirect } from "next/navigation";
import { getAdminTenantContext, buildUserPesantrenWhere } from "@/lib/tenant";

export default async function AdminUsersPage() {
  const ctx = await getAdminTenantContext();

  if (!ctx) {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    where: buildUserPesantrenWhere(ctx),
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <UsersClient
        users={users}
        isSuperAdmin={ctx.isSuperAdmin}
        activePesantrenId={ctx.activePesantrenId}
        pesantrenList={ctx.pesantrenList.map((p) => ({ id: p.id, namaPesantren: p.namaPesantren }))}
      />
    </div>
  );
}
