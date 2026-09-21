import { getAdminExams } from "@/actions/exam";
import QuestionsClient from "./QuestionsClient";

export default async function AdminQuestionsPage() {
  const exams = await getAdminExams();
  // Pass the exams (with their sections) to the client component
  return <QuestionsClient initialPackages={exams} />;
}
