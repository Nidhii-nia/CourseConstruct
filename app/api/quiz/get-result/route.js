import { db } from "@/config/db";
import {
  quizTable,
  quizAttemptTable,
  quizStatsTable,
} from "@/config/schema";
import { eq, desc, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get("quizId");
    const useremail = searchParams.get("useremail");

    if (!quizId || !useremail) {
      return NextResponse.json(
        { error: "Missing params" },
        { status: 400 }
      );
    }

    /* =========================
       1. GET QUIZ
    ========================= */
    const quiz = await db
      .select()
      .from(quizTable)
      .where(eq(quizTable.id, Number(quizId)));

    if (!quiz.length) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    /* =========================
       2. GET USER ATTEMPTS
    ========================= */
    const attempts = await db
      .select()
      .from(quizAttemptTable)
      .where(
        and(
          eq(quizAttemptTable.quizId, Number(quizId)),
          eq(quizAttemptTable.useremail, useremail)
        )
      )
      .orderBy(desc(quizAttemptTable.createdAt));

    if (!attempts.length) {
      return NextResponse.json(
        { error: "No attempt found" },
        { status: 404 }
      );
    }

    /* =========================
       3. ANALYTICS
    ========================= */

    // ✅ BEST SCORE (safe)
    const bestAttempt = attempts.reduce((best, curr) =>
      curr.percentage > best.percentage ? curr : best
    );

    // ✅ FIRST ATTEMPT
    const firstAttempt = attempts[attempts.length - 1];

    // ✅ IMPROVEMENT
    const improvement =
      attempts.length > 1
        ? bestAttempt.percentage - firstAttempt.percentage
        : 0;

        const totalAttempts = attempts.length;

    /* =========================
       4. RANK CALCULATION (FIXED)
    ========================= */

    const allUsersAttempts = await db
      .select()
      .from(quizAttemptTable)
      .where(eq(quizAttemptTable.quizId, Number(quizId)));

    const bestScoresMap = {};

    allUsersAttempts.forEach((a) => {
      if (
        !bestScoresMap[a.useremail] ||
        a.percentage > bestScoresMap[a.useremail]
      ) {
        bestScoresMap[a.useremail] = a.percentage;
      }
    });

    const sortedScores = Object.values(bestScoresMap).sort(
      (a, b) => b - a
    );

    const userBest = bestAttempt.percentage;

    // ✅ FIXED RANK (handles duplicates correctly)
    const rank =
      sortedScores.filter((score) => score > userBest).length + 1;

    /* =========================
       5. STATS
    ========================= */
    const stats = await db
      .select()
      .from(quizStatsTable)
      .where(eq(quizStatsTable.quizId, Number(quizId)));

      const uniqueUsers = Object.keys(bestScoresMap).length;
    /* =========================
       6. RESPONSE
    ========================= */
    return NextResponse.json({
      quiz: quiz[0].quizJson,
      latestAttempt: attempts[0],
      allAttempts: attempts,
      totalAttempts,
      stats: stats[0] || { avgScore: 0, totalAttempts: 0 },

      bestAttempt,
      improvement,
      rank,

totalUsers: uniqueUsers,
      cid: quiz[0].cid,
    });
  } catch (err) {
    console.error("Result API Error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}