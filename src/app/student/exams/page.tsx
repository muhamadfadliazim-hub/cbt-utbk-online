import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getStudentExams } from "@/actions/exam";
import StudentExamsClient from "./StudentExamsClient";

export default async function StudentExamsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    return <div>Silakan login.</div>;
  }
  
  const allowedTypes = (session.user as any).allowedExamTypes || [];
  const exams = await getStudentExams(allowedTypes);

  return <StudentExamsClient initialExams={exams} allowedTypes={allowedTypes} />;
}
