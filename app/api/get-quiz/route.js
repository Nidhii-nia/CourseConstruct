import { db } from "@/configs/db";
import { quizTable } from "@/configs/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");

    if (!quizId) {
      return NextResponse.json({ error: "Missing quizId" }, { status: 400 });
    }

    const quiz = await db
      .select()
      .from(quizTable)
      .where(eq(quizTable.id, Number(quizId)));

    if (!quiz.length) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      quiz: quiz[0],
    });
  } catch (err) {
    console.error("Get Quiz Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}