import { NextResponse } from "next/server";
import { ai } from "../generate-course-layout/route";
import axios from "axios";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";

const PROMPT = `
Generate detailed HTML content for each topic.
Output ONLY valid JSON in this exact format:

{
  "chapterName": "",
  "topics": [
    {
      "topic": "",
      "content": ""
    }
  ]
}

Rules:
- Do NOT add duration
- Do NOT add extra keys
- Do NOT add explanations
- Only return JSON
- Content must be inside <div> ... </div> blocks
User Input:
`;

export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "courseId is missing in request body" },
        { status: 400 }
      );
    }

    if (!courseJson?.chapters?.length) {
      return NextResponse.json(
        { error: "Invalid courseJson. No chapters found." },
        { status: 400 }
      );
    }

    const promises = courseJson.chapters.map(async (chapter) => {
      const model = "gemini-2.0-flash";

      const contents = [
        {
          role: "user",
          parts: [{ text: PROMPT + JSON.stringify(chapter) }],
        },
      ];

      // ---- AI CALL ----
      const response = await ai.models.generateContent({ model, contents });

      const raw = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();

      const parsedJSON = safeParse(cleaned);

      // ---- YOUTUBE ----
      const youtubeData = await GetYoutubeVideo(chapter.chapterName);

      return {
        youtubeVideo: youtubeData,
        courseData: parsedJSON,
      };
    });

    const output = await Promise.all(promises);

    // ---- SAVE TO DB ----
    await db
      .update(coursesTable)
      .set({
        courseContent: output,
      })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      courseName: courseTitle,
      CourseContent: output,
    });
  } catch (err) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json(
      { error: "Failed to generate content", details: err.message },
      { status: 500 }
    );
  }
}

/* ------------------------------------------
      SAFE JSON AUTO-FIX PARSER
------------------------------------------- */
function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    console.warn("⚠️ Direct JSON parse failed. Attempting auto-fix...");

    let fixed = str;

    // Remove trailing commas
    fixed = fixed.replace(/,\s*([}\]])/g, "$1");

    // Fix unmatched curly braces
    const openCurly = (fixed.match(/{/g) || []).length;
    const closeCurly = (fixed.match(/}/g) || []).length;
    if (closeCurly < openCurly) {
      fixed += "}".repeat(openCurly - closeCurly);
    }

    // Fix unmatched array brackets
    const openArr = (fixed.match(/\[/g) || []).length;
    const closeArr = (fixed.match(/\]/g) || []).length;
    if (closeArr < openArr) {
      fixed += "]".repeat(openArr - closeArr);
    }

    try {
      return JSON.parse(fixed);
    } catch (err) {
      console.error("❌ FINAL JSON PARSE ERROR:", fixed);
      throw new Error("AI returned invalid JSON and auto-fix failed.");
    }
  }
}

/* ------------------------------------------
      YOUTUBE API FUNCTION
------------------------------------------- */
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";

async function GetYoutubeVideo(topic) {
  if (!process.env.YOUTUBE_API_KEY) {
    console.error("❌ YOUTUBE_API_KEY not found.");
    return [];
  }

  try {
    const params = {
      part: "snippet",
      q: `${topic} tutorial`,
      maxResults: 4,
      type: "video",
      key: process.env.YOUTUBE_API_KEY,
    };

    const resp = await axios.get(YOUTUBE_BASE_URL, { params });

    return (resp.data.items || []).map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
    }));
  } catch (err) {
    console.error("❌ YOUTUBE API ERROR:", err.response?.data || err.message);
    return [];
  }
}


///edit-course/92ddb3a4-2f41-4e0c-8d58-7d9be0b34965