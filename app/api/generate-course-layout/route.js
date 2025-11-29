import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { v4 as uuid4 } from "uuid";
import { InferenceClient } from "@huggingface/inference";

const PROMPT = `Generate Learning Course based on the following details. 
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

// -------------------
// Wait helper
// -------------------
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(req) {
  try {
    const formData = await req.json();

    if (typeof formData.includeVideo !== "boolean") formData.includeVideo = false;

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - User not logged in" }, { status: 401 });
    }

    // -----------------------------
    // 1. Gemini 2.5 — generate course
    // -----------------------------
    const tools = [{ googleSearch: {} }];
    const model = "gemini-2.0-flash";
    const contents = [{ role: "user", parts: [{ text: PROMPT + JSON.stringify(formData) }] }];

    let retries = 3;
    let rawText = "";
    while (retries > 0) {
      try {
        const response = await ai.models.generateContent({ model, contents });
        rawText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "";
        break; // success, exit loop
      } catch (err) {
        const isRateLimit = err?.status === 429 || err?.response?.status === 429;
        if (isRateLimit) {
          const retryAfter = parseInt(err?.response?.data?.retryDelay?.seconds || 60, 10);
          console.log(`Rate limit hit. Waiting ${retryAfter}s before retrying...`);
          await wait(retryAfter * 1000);
          retries--;
        } else {
          throw err;
        }
      }
    }

    if (!rawText) {
      return NextResponse.json({ error: "Failed to generate course content after retries" }, { status: 500 });
    }

    // Attempt to extract valid JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in AI output:", rawText);
      return NextResponse.json({ error: "AI returned no JSON", raw: rawText }, { status: 500 });
    }

    let generatedCourse;
    try {
      generatedCourse = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.error("JSON parsing error:", jsonMatch[0]);
      return NextResponse.json({ error: "AI returned invalid JSON", raw: jsonMatch[0] }, { status: 500 });
    }

    const bannerPrompt = generatedCourse.course?.bannerImagePrompt || "3D flat-style UI/UX design, vibrant colors";

    // -----------------------------
    // 2. Generate banner image (HuggingFace)
    // -----------------------------
    const bannerImgUrl = await GenerateImage(bannerPrompt);

    // -----------------------------
    // 3. Save to DB
    // -----------------------------
    const cid = uuid4();
    await db.insert(coursesTable).values({
      cid,
      ...formData,
      includeVideo: formData.includeVideo,
      courseJson: generatedCourse,
      useremail: user?.primaryEmailAddress?.emailAddress,
      bannerImgUrl,
    });

    return NextResponse.json({ success: true, cid, course: generatedCourse });
  } catch (err) {
    console.error("Internal Error:", err);
    return NextResponse.json({ error: "Internal Server Error", details: err.message }, { status: 500 });
  }
}

// -------------------
// HuggingFace Image Generator
// -------------------
const GenerateImage = async (prompt) => {
  try {
    const hf = new InferenceClient(process.env.HF_TOKEN);
    const response = await hf.textToImage({
      model: "stabilityai/stable-diffusion-xl-base-1.0",
      inputs: prompt,
      parameters: { width: 768, height: 432, num_inference_steps: 30 }
    });

    // The response will be a Blob (browser) or ArrayBuffer/Buffer (Node)
    if (response?.blob) {
      const buffer = Buffer.from(await response.blob());
      return `data:image/png;base64,${buffer.toString("base64")}`;
    } else if (response?.arrayBuffer) {
      const buffer = Buffer.from(await response.arrayBuffer());
      return `data:image/png;base64,${buffer.toString("base64")}`;
    } else if (response instanceof Buffer) {
      return `data:image/png;base64,${response.toString("base64")}`;
    } else {
      // If API returns base64 directly
      return response?.base64 ? `data:image/png;base64,${response.base64}` : "/books.png";
    }
  } catch (err) {
    console.error("Image generation failed:", prompt, err);
    return "/books.png"; // fallback
  }
};

