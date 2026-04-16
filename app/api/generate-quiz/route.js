import { db } from "@/configs/db";
import {
  quizTable,
  coursesTable,
  enrollCourseTable,
} from "@/configs/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import axios from "axios";

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
    const completed = enrollment.completedChapters?.length || 0;

    if (totalChapters === 0 || completed !== totalChapters) {
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
    ).slice(0, 15000); // token safety

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
       6. CALL QWEN MODEL
    ========================= */
    const aiRes = await axios.post(
      "https://api.siliconflow.cn/v1/chat/completions",
      {
        model: "Qwen/Qwen3-VL-32B-Instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SILICON_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    let raw = aiRes.data.choices[0].message.content;

    /* =========================
       7. CLEAN RESPONSE (VERY IMPORTANT)
    ========================= */
    raw = raw.replace(/```json|```/g, "").trim();

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("❌ AI JSON Parse Error:", raw);
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