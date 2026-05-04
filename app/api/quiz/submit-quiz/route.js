import { db } from "@/config/db";
import {
  quizTable,
  quizAttemptTable,
  quizStatsTable,
} from "@/config/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { quizId, answers, useremail } = await req.json();

    const quiz = await db
      .select()
      .from(quizTable)
      .where(eq(quizTable.id, Number(quizId)));

    if (!quiz.length) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const questions = quiz[0].quizJson.questions;

    let score = 0;

    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        score++;
      }
    });

    const total = questions.length;
    const percentage = Math.round((score / total) * 100);

    /* SAVE ATTEMPT */
    await db.insert(quizAttemptTable).values({
      quizId: Number(quizId),
      useremail,
      answers,
      score,
      total,
      percentage,
    });

    /* UPDATE STATS */
    const stats = await db
      .select()
      .from(quizStatsTable)
      .where(eq(quizStatsTable.quizId, Number(quizId)));

    if (stats.length) {
      const old = stats[0];

      const newAttempts = old.totalAttempts + 1;
      const newAvg = Math.round(
        (old.avgScore * old.totalAttempts + percentage) / newAttempts
      );

      await db
        .update(quizStatsTable)
        .set({
          avgScore: newAvg,
          totalAttempts: newAttempts,
        })
        .where(eq(quizStatsTable.quizId, Number(quizId)));
    } else {
      await db.insert(quizStatsTable).values({
        quizId: Number(quizId),
        avgScore: percentage,
        totalAttempts: 1,
      });
    }

    return NextResponse.json({
      score,
      total,
      percentage,
    });
  } catch (err) {
    console.error("Submit Quiz Error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}