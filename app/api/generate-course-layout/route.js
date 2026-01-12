import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuid4 } from "uuid";
import { InferenceClient } from "@huggingface/inference";
import { eq } from "drizzle-orm";
import { Groq } from "groq-sdk";

// --------------------------------------------------
// AI Prompt
// --------------------------------------------------
const PROMPT = `Genrate Learning Course depends on following details. 
In which Make sure to add Course Name, Description,Course Banner Image Prompt 
(Create a modern, flat-style 2D digital illustration representing user Topic.
 Include UI/UX elements such as mockup screens, text blocks, icons, buttons,
  and creative workspace tools. Add symbolic elements related to user Course, 
  like sticky notes, design components, and visual aids. Use a vibrant color 
  palette (blues, purples, oranges) with a clean, professional look.
   The illustration should feel creative, tech-savvy, and educational,
    ideal for visualizing concepts in user Course) for Course Banner in
     3d format Chapter Name, , Topic under each chapters , Duration for each chapters etc,
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
        "topics": [
          "string"
        ],
     
      }
    ]
  }
}

, User Input:  `;

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Helper
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// --------------------------------------------------
// POST Handler
// --------------------------------------------------
export async function POST(req) {
  try {
    const formData = await req.json();
    const { clientRequestId } = formData;

    if (!clientRequestId) {
      return NextResponse.json(
        { error: "clientRequestId is required" },
        { status: 400 }
      );
    }

    if (typeof formData.includeVideo !== "boolean")
      formData.includeVideo = false;

    const user = await currentUser();

    const { has } = await auth();
    const hasPremiumAccess = has({ plan: "premium" });

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - User not logged in" },
        { status: 401 }
      );
    }

    // --------------------------------------------------
    // 0. Check if already generated for this clientRequestId
    // --------------------------------------------------
    const existing = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.clientRequestIdContent, clientRequestId));

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        cid: existing[0].cid,
        course: existing[0].courseJson,
      });
    }

    // --------------------------------------------------
    // 1. Check duplicate course name
    // --------------------------------------------------
    const duplicateName = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.name, formData.name));

    if (duplicateName.length > 0) {
      return NextResponse.json(
        {
          error: "Course with this name already exists",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // 2. Generate Course using Groq
    // --------------------------------------------------
    let retries = 3;
    let rawText = "";

    // If user already created any course?
    if (!hasPremiumAccess) {
      const result = await db
        .select()
        .from(coursesTable)
        .where(
          eq(coursesTable.useremail, user?.primaryEmailAddress?.emailAddress)
        );

      if (result?.length >= 1) {
        return NextResponse.json({ resp: "limit exceeded" });
      }
    }

    while (retries > 0) {
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            {
              role: "user",
              content: PROMPT + JSON.stringify(formData),
            },
          ],
          model: "openai/gpt-oss-120b", // Using the exact model from your example
          temperature: 1,
          max_completion_tokens: 8192,
          top_p: 1,
          stream: false, // Changed to false for easier handling
          reasoning_effort: "medium",
          stop: null,
        });

        rawText = chatCompletion.choices[0]?.message?.content || "";
        break;
      } catch (err) {
        const isRateLimit = err?.status === 429;

        if (isRateLimit) {
          const retryAfter = 30;
          console.log(
            `Rate limit hit. Retrying in ${retryAfter}s... attempt left: ${
              retries - 1
            }`
          );
          await wait(retryAfter * 1000);
          retries--;
        } else {
          console.error("Groq API error:", err);
          throw err;
        }
      }
    }

    if (!rawText) {
      return NextResponse.json(
        { error: "Failed to generate course after retries" },
        { status: 500 }
      );
    }

    // Extract JSON from AI response
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("AI returned no JSON:", rawText);
      return NextResponse.json(
        { error: "AI returned no JSON", raw: rawText },
        { status: 500 }
      );
    }

    let generatedCourse;
    try {
      generatedCourse = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("Invalid JSON from AI:", jsonMatch[0]);
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: jsonMatch[0] },
        { status: 500 }
      );
    }

    const bannerPrompt =
      generatedCourse.course?.bannerImagePrompt ||
      "3D flat-style UI/UX design, vibrant colors";

    // --------------------------------------------------
    // 3. Generate Banner using HuggingFace
    // --------------------------------------------------
    const bannerImgUrl = await GenerateImage(bannerPrompt);

    // --------------------------------------------------
    // 4. Save to DB
    // --------------------------------------------------
    const cid = uuid4();

    await db.insert(coursesTable).values({
      cid,
      clientRequestId,
      ...formData,
      includeVideo: formData.includeVideo,
      courseJson: generatedCourse,
      useremail: user?.primaryEmailAddress?.emailAddress,
      bannerImgUrl,
    });

    return NextResponse.json({ success: true, cid, course: generatedCourse });
  } catch (err) {
    console.error("Internal Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

// --------------------------------------------------
// HuggingFace Image Generation
// --------------------------------------------------
const GenerateImage = async (prompt) => {
  try {
    const hf = new InferenceClient(process.env.HF_TOKEN);
    const response = await hf.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: prompt,
      parameters: { width: 768, height: 432, num_inference_steps: 30 },
    });

    if (response?.blob) {
      const buffer = Buffer.from(await response.blob());
      return `data:image/png;base64,${buffer.toString("base64")}`;
    } else if (response?.arrayBuffer) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return `data:image/png;base64,${buffer.toString("base64")}`;
    } else if (response instanceof Buffer) {
      return `data:image/png;base64,${response.toString("base64")}`;
    } else {
      return response?.base64
        ? `data:image/png;base64,${response.base64}`
        : "/books.png";
    }
  } catch (err) {
    console.error("Image generation failed for prompt:", prompt, err);
    return "/books.png";
  }
};
