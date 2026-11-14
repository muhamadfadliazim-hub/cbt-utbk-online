import { redirect } from "next/navigation";

export default async function TakeExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/cbt/${id}`);
}
