import { NextResponse } from "next/server";
import { ACTIVE_PESANTREN_COOKIE, getAdminTenantContext } from "@/lib/tenant";

export async function GET() {
  const ctx = await getAdminTenantContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    isSuperAdmin: ctx.isSuperAdmin,
    managedPesantrenId: ctx.managedPesantrenId,
    activePesantrenId: ctx.activePesantrenId,
    pesantrenList: ctx.isSuperAdmin
      ? ctx.pesantrenList
      : ctx.pesantrenList.filter((p) => p.id === ctx.managedPesantrenId),
  });
}

export async function POST(req: Request) {
  const ctx = await getAdminTenantContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ctx.isSuperAdmin) {
    return NextResponse.json(
      { error: "Hanya Super Admin yang dapat berpindah pesantren." },
      { status: 403 }
    );
  }

  const body = await req.json();
  const pesantrenId = body?.pesantrenId ? String(body.pesantrenId) : "ALL";

  if (pesantrenId !== "ALL" && !ctx.pesantrenList.some((p) => p.id === pesantrenId)) {
    return NextResponse.json({ error: "Pesantren tidak ditemukan." }, { status: 404 });
  }

  const res = NextResponse.json({ success: true, activePesantrenId: pesantrenId === "ALL" ? null : pesantrenId });
  res.cookies.set(ACTIVE_PESANTREN_COOKIE, pesantrenId, {
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return res;
}

