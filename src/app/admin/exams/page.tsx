import { getAdminExams } from "@/actions/exam";
import AdminExamsClient from "./AdminExamsClient";

export default async function AdminExamsPage() {
  const exams = await getAdminExams();

  return (
    <AdminExamsClient initialExams={exams} />
  );
}

