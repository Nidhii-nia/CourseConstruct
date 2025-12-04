import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { v4 as uuid4 } from "uuid";
import { InferenceClient } from "@huggingface/inference";
import { eq } from "drizzle-orm";

// --------------------------------------------------
// AI Prompt
// --------------------------------------------------
const PROMPT = `Generate Learning Course based on the following details and ensure to keep everything like in professional or popular textbooks also keep in mind to give the chapter names a little descriptive so that while fetching videos we get relevent videos. 
Make sure to add:
- Course Name
- Description
- Category
- Level
- Include Video (boolean)
- Number of Chapters
- Banner Image Prompt (3D flat-style UI/UX design, vibrant colors)
- Chapters: chapterName, duration, topics[]
Return ONLY JSON in this schema:
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
User Input:
`;

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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
    // 2. Generate Course using Gemini
    // --------------------------------------------------
    const model = "gemini-2.0-flash";
    const contents = [
      { role: "user", parts: [{ text: PROMPT + JSON.stringify(formData) }] },
    ];

    let retries = 3;
    let rawText = "";

    while (retries > 0) {
      try {
        const response = await ai.models.generateContent({ model, contents });
        rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        break;
      } catch (err) {
        const isRateLimit =
          err?.status === 429 || err?.response?.status === 429;

        if (isRateLimit) {
          const retryAfter = parseInt(
            err?.response?.data?.retryDelay?.seconds || 30,
            10
          );
          console.log(
            `Rate limit hit. Retrying in ${retryAfter}s... attempt left: ${retries - 1}`
          );
          await wait(retryAfter * 1000);
          retries--;
        } else {
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