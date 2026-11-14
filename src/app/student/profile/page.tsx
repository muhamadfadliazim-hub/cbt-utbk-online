import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser } from "@/lib/sessionUser";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";

import fs from "fs";
import path from "path";

export default async function StudentProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect('/login');
  }

  const targetUserId = await ensureSessionUser(session);

  const dbUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { 
      name: true, 
      schoolName: true,
      snbpTargetUniv: true, 
      snbpTargetMajor: true 
    }
  });

  const user = dbUser || {
    name: session.user.name || "Peserta CBT",
    schoolName: (session.user as any).schoolName || "",
    snbpTargetUniv: "",
    snbpTargetMajor: "",
  };

  const dataPath = path.join(process.cwd(), 'public/data/majors-2027.json');
  const fileContents = fs.readFileSync(dataPath, 'utf8');
  const dataset = JSON.parse(fileContents);
  
  const universityMap = new Map();
  dataset.majors.forEach((m: any) => {
    if (!universityMap.has(m.ptn)) {
      universityMap.set(m.ptn, { id: m.ptn, name: m.ptn, majors: [] });
    }
    universityMap.get(m.ptn).majors.push({ id: m.id, name: m.major });
  });

  const universities = Array.from(universityMap.values()).sort((a: any, b: any) => a.name.localeCompare(b.name));

  return (
    <div>
      <ProfileClient user={user} universities={universities} />
    </div>
  );
}
