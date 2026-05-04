import { db } from "../../../../config/db";
import {
  quizTable,
  coursesTable,
  enrollCourseTable,
} from "../../../../config/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

/* =========================
   INIT GROQ
========================= */
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { cid, useremail } = await req.json();

    if (!cid || !useremail) {
      return NextResponse.json(
        { error: "Missing cid or useremail" },
        { status: 400 }
      );
    }

    /* =========================
       1. FETCH COURSE
    ========================= */
    const course = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, cid));

    if (!course.length) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const courseData = course[0];

    /* =========================
       2. CHECK ENROLLMENT
    ========================= */
    const enroll = await db
      .select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(enrollCourseTable.cid, cid),
          eq(enrollCourseTable.useremail, useremail)
        )
      );

    if (!enroll.length) {
      return NextResponse.json(
        { error: "User not enrolled" },
        { status: 403 }
      );
    }

    const enrollment = enroll[0];

    /* =========================
       3. CHECK COMPLETION
    ========================= */

    const totalChapters = courseData.courseContent?.length || 0;

    let completedArray = enrollment.completedChapters;

    if (typeof completedArray === "string") {
      try {
        completedArray = JSON.parse(completedArray);
      } catch {
        completedArray = [];
      }
    }

    if (!Array.isArray(completedArray)) {
      completedArray = [];
    }

    const completed = completedArray.length;

    if (
      totalChapters === 0 ||
      completed !== totalChapters
    ) {
      return NextResponse.json(
        { error: "Complete the course first" },
        { status: 400 }
      );
    }

    /* =========================
       4. CHECK EXISTING QUIZ
    ========================= */
    const existingQuiz = await db
      .select()
      .from(quizTable)
      .where(eq(quizTable.cid, cid));

    if (existingQuiz.length) {
      return NextResponse.json({
        quizId: existingQuiz[0].id,
        reused: true,
      });
    }

    /* =========================
       5. PREPARE CONTENT
    ========================= */
    const trimmedContent = JSON.stringify(
      courseData.courseContent
    ).slice(0, 15000);

    const prompt = `
You are an expert educator.

Generate a quiz based ONLY on the provided course content.

Rules:
- 10 questions
- Multiple choice (MCQ)
- 4 options each
- Include correctAnswer
- Include explanation

Return STRICT JSON only:
{
  "questions": [
    {
      "question": "",
      "options": ["", "", "", ""],
      "correctAnswer": "",
      "explanation": ""
    }
  ]
}

CONTENT:
${trimmedContent}
`;

    /* =========================
       6. CALL GROQ MODEL
    ========================= */
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_completion_tokens: 2000,
    });

    let raw =
      chatCompletion.choices?.[0]?.message?.content || "";

    if (!raw) {
      return NextResponse.json(
        { error: "AI failed to generate quiz" },
        { status: 500 }
      );
    }

    /* =========================
       7. CLEAN RESPONSE
    ========================= */
    raw = raw.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ JSON Parse Error:", raw);

      return NextResponse.json(
        { error: "Invalid AI response" },
        { status: 500 }
      );
    }

    if (!parsed?.questions?.length) {
      return NextResponse.json(
        { error: "Empty quiz generated" },
        { status: 500 }
      );
    }

    /* =========================
       8. SAVE QUIZ
    ========================= */
    const inserted = await db
      .insert(quizTable)
      .values({
        cid,
        generatedBy: useremail,
        quizJson: parsed,
        totalQuestions: parsed.questions.length,
      })
      .returning();

    return NextResponse.json({
      quizId: inserted[0].id,
      reused: false,
    });
  } catch (err) {
    console.error("🔥 Generate Quiz Error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}