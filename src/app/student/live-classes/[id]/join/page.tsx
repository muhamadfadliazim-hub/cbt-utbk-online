import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import LiveClassRoomWrapper from "@/components/student/LiveClassRoomWrapper";

export default async function JoinLiveClassPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const { id } = await params;

  const liveClass = await prisma.liveClass.findUnique({
    where: { id: id }
  });

  if (!liveClass) {
    return <div style={{ padding: "40px", textAlign: "center" }}>Kelas tidak ditemukan.</div>;
  }

  const userName = session.user.name || "Student";

  return (
    <div style={{ padding: "10px", height: "100vh", background: "#000" }}>
      {/* We pass the roomName from DB to Jitsi wrapper */}
        <LiveClassRoomWrapper 
          roomName={liveClass.roomName || liveClass.id} 
          subject={liveClass.title}
          userName={userName}
        />
    </div>
  );
}
