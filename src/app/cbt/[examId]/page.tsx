import { getExamForCbt } from "@/actions/exam";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CBTEngineClient from "./CBTEngineClient";
import { redirect } from "next/navigation";

export default async function CBTPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/student/login");
  }

  const res = await getExamForCbt(examId);
  
  if (res.error || !res.exam) {
    return <div>{res.error || "Ujian tidak ditemukan"}</div>;
  }

  // Restructure questions array for the client
  const allQuestions = res.exam.sections.flatMap(section => 
    section.questions.map(q => ({
      ...q,
      section: section.title,
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
      answerKey: typeof q.answerKey === 'string' ? JSON.parse(q.answerKey) : q.answerKey,
    }))
  );

  return (
    <CBTEngineClient 
      examId={examId} 
      initialExam={res.exam} 
      initialQuestions={allQuestions}
      studentProfile={{ targetMajor: (session.user as any).targetMajor }}
    />
  );
}
