import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import { marked } from "marked";
import markedKatex from "marked-katex-extension";

// Configure marked to use Katex for math parsing
marked.use(markedKatex({
  throwOnError: false,
  displayMode: true // Support $$ block math
}));

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sectionId, questions } = await req.json();

    if (!sectionId || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Process markdown and LaTeX for each question before saving
    const processedQuestions = questions.map((q: any) => {
      // Parse main content (can contain multiline wacana, tables, LaTeX)
      const htmlContent = marked.parse(q.content) as string;
      
      // Parse options (usually single line, but could contain LaTeX)
      const parsedOptions = q.options.map((opt: string) => {
        // use parseInline to prevent wrapping options in <p> tags
        return marked.parseInline(opt) as string;
      });

      return {
        sectionId,
        type: "PILIHAN_GANDA",
        content: htmlContent,
        options: JSON.stringify(parsedOptions),
        answerKey: marked.parseInline(q.answerKey) as string,
      };
    });

    // Insert all questions
    const createdQuestions = await prisma.$transaction(
      processedQuestions.map((data: any) => prisma.question.create({ data }))
    );

    return NextResponse.json({ success: true, count: createdQuestions.length });
  } catch (error) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
