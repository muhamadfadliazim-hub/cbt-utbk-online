import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser } from "@/lib/sessionUser";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUserId = await ensureSessionUser(session);
    const body = await request.json();
    const { name, schoolName, snbpTargetUniv, snbpTargetMajor } = body;

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        name,
        schoolName,
        snbpTargetUniv,
        snbpTargetMajor,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil" }, { status: 500 });
  }
}
