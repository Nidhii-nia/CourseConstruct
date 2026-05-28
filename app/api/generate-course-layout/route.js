import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";

import {  currentUser } from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

import { eq, and } from "drizzle-orm";

import { Groq } from "groq-sdk";
// ======================================================
// 🤖 AI PROMPT (UNCHANGED)
// ======================================================

const PROMPT = `Genrate Learning Course depends on following details. You should generate a description by yourself.
In which Make sure to add Course Name, Description,Course Banner Image Prompt
(Create a modern, flat-style 2D digital illustration representing user Topic.
Include UI/UX elements such as mockup screens, text blocks, icons, buttons,
and creative workspace tools. Add symbolic elements related to user Course,
like sticky notes, design components, and visual aids. Use a vibrant color
palette (blues, purples, oranges) with a clean, professional look.
The illustration should feel creative, tech-savvy, and educational,
ideal for visualizing concepts in user Course) for Course Banner in
3d format Chapter Name, Topic under each chapters, Duration for each chapters etc,
in JSON format only

Schema:
{
"course": {
"name": "string",
"description": "string",
"category": "string",
"level": "string",
"includeVideo": "boolean",
"noOfChapters": "number",
"bannerImagePrompt": "string",
"chapters": [
{
"chapterName": "string",
"duration": "string",
"topics": ["string"]
}
]
}
}
Rule - give 3 topics per chapter only
, User Input:  `;

// ======================================================
// 🚀 GROQ CLIENT
// ======================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// 🛡️ SAFE JSON EXTRACTOR
// ======================================================

function extractJson(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);

    if (!match) return null;

    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

// ======================================================
// ✅ VALIDATE COURSE STRUCTURE
// ======================================================

function isValidCourse(course) {
  return course && course.course && Array.isArray(course.course.chapters);
}

// ======================================================
// 🔁 RETRY MODEL GENERATION
// ======================================================

async function generateWithRetry(model, safeFormData, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: PROMPT + JSON.stringify(safeFormData),
          },
        ],

        model,

        temperature: 0.8,

        max_completion_tokens: 2200,
      });

      const raw = completion.choices?.[0]?.message?.content || "";

      console.log(`🧠 ${model} Attempt ${attempt}`);

      const parsed = extractJson(raw);

      if (isValidCourse(parsed)) {
        return parsed;
      }

      console.warn(`⚠️ Invalid JSON from ${model}`);
    } catch (err) {
      console.error(`❌ ${model} Retry ${attempt} failed`, err.message);
    }

    // ⏳ SMALL BACKOFF
    await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
  }

  throw new Error(`Failed after retries for model: ${model}`);
}

// ======================================================
// 🚀 POST
// ======================================================

export async function POST(req) {
  try {
    // ==================================================
    // 📦 BODY
    // ==================================================

    const formData = await req.json();

    const { clientRequestId } = formData;

    if (!clientRequestId) {
      return NextResponse.json(
        {
          error: "clientRequestId is required",
        },
        { status: 400 },
      );
    }

    // ==================================================
    // 🔐 AUTH
    // ==================================================

    const user = await currentUser();


    if (!user) {
      return NextResponse.json(
        {
          error: "Unauthorized - User not logged in",
        },
        { status: 401 },
      );
    }

    // ==================================================
    // 🔄 EXISTING REQUEST CHECK
    // ==================================================

    const existing = await db
      .select({
        cid: coursesTable.cid,
        courseJson: coursesTable.courseJson,
      })
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.clientRequestIdContent, clientRequestId),

          eq(coursesTable.isDeleted, false),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        cid: existing[0].cid,
        course: existing[0].courseJson,
      });
    }

    // ==================================================
    // ✅ VALIDATION
    // ==================================================

    const sanitizedName = formData.name?.trim() || "";

    const sanitizedNoOfChapters = parseInt(formData.noOfChapters ?? "0", 10);

    if (!sanitizedName) {
      return NextResponse.json(
        {
          success: false,
          error: "Course name is required",
        },
        { status: 400 },
      );
    }

    // ==================================================
    // 🛡️ SAFE INPUT
    // ==================================================

    const safeFormData = {
      name: sanitizedName,

      description: formData.description?.slice(0, 200) || "",

      category: formData.category || "",

      level: formData.level || "",

      includeVideo:
        typeof formData.includeVideo === "boolean"
          ? formData.includeVideo
          : false,

      noOfChapters: sanitizedNoOfChapters,
    };

    // ==================================================
    // 🤖 GENERATE BOTH LAYOUTS
    // ==================================================

    const [layoutA, layoutB] = await Promise.all([
      generateWithRetry("openai/gpt-oss-120b", safeFormData),

      generateWithRetry("openai/gpt-oss-20b", safeFormData),
    ]);

    // ==================================================
    // ✅ RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,

      layouts: [
        {
          id: "A",
          data: layoutA,
        },

        {
          id: "B",
          data: layoutB,
        },
      ],
    });
  } catch (err) {
    console.error("Internal Error:", err);

    return NextResponse.json(
      {
        error: "Internal Server Error",

        details: err?.message || "Unknown error",
      },

      { status: 500 },
    );
  }
}
