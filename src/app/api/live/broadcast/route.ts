import { NextResponse } from "next/server";
import { pusherServer } from "@/lib/pusher";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { message, channel = "global", event = "broadcast" } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const payload = {
      message,
      sender: session.user.name,
      timestamp: new Date().toISOString(),
    };

    await pusherServer.trigger(channel, event, payload);

    return NextResponse.json({ success: true, payload });
  } catch (error) {
    console.error("Broadcast Error:", error);
    return NextResponse.json({ error: "Failed to broadcast message" }, { status: 500 });
  }
}
