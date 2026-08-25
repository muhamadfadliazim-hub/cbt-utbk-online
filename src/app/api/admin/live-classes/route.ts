import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const classes = await prisma.liveClass.findMany({
      orderBy: { scheduledAt: 'desc' }
    });

    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, scheduledAt, targetSchool, targetUserEmail } = body;

    if (!title || !scheduledAt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate a unique room name for Jitsi
    const roomName = `AZ-Academy-${title.replace(/[^a-zA-Z0-9]/g, "")}-${Date.now()}`;

    const newClass = await prisma.liveClass.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        roomName,
        isActive: true,
        targetSchool: targetSchool || null,
        targetUserEmail: targetUserEmail || null,
      }
    });

    return NextResponse.json(newClass);
  } catch (error) {
    console.error("Create Live Class Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
