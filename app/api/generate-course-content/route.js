import { NextResponse } from "next/server";
import { ai } from "../generate-course-layout/route";
import axios from "axios";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";

const PROMPT = `
Generate detailed HTML content for each topic for students or scholars so they could read and understand topics deeply keep it professional like textbooks with examples where required like questions and there answers for understanding.
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
- "content" must be valid HTML wrapped in a single <div> ... </div> block
- Inside the <div>, structure content as:
  - Main topic title as an underlined heading using <h2><u> ... </u></h2>
  - Each subtopic as an underlined subheading using <h3><strong>...</strong></h3>
  - For any "Key Features" or similar sections, use a <ul> with each feature as a separate <li> item
  - Use <ul> and <li> for other bullet-point content where appropriate
  - You may use <p>, <strong>, <em>, and <br> as needed, but keep the structure semantic

User Input:
`;

export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId, clientRequestId } = await req.json();

    if (!courseId) {
      return NextResponse.json({ error: "courseId is missing in request body" }, { status: 400 });
    }

    if (!courseJson?.chapters?.length) {
      return NextResponse.json({ error: "Invalid courseJson. No chapters found." }, { status: 400 });
    }

    if (!clientRequestId) {
      return NextResponse.json({ error: "clientRequestId is required" }, { status: 400 });
    }

    // -----------------------------
    // Check if content already generated for this request
    // -----------------------------
    const existing = await db.select().from(coursesTable)
      .where(eq(coursesTable.clientRequestIdContent, clientRequestId))
      .execute();

    if (existing.length > 0) {
      return NextResponse.json({
        courseName: courseTitle,
        CourseContent: existing[0].courseContent
      });
    }

    // -----------------------------
    // Generate content for each chapter
    // -----------------------------
    const promises = courseJson.chapters.map(async (chapter) => {
      const model = "gemini-2.0-flash";
      const contents = [{ role: "user", parts: [{ text: PROMPT + JSON.stringify(chapter) }] }];

      const response = await ai.models.generateContent({ model, contents });

      const raw = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
      const cleaned = raw.replace(/```json|```/g, "").trim();
      const parsedJSON = safeParse(cleaned);

      // ---- YOUTUBE ----
      const youtubeData = await GetYoutubeVideo(chapter?.chapterName,courseJson?.course?.name);

      return {
        youtubeVideo: youtubeData,
        courseData: parsedJSON,
      };
    });

    const output = await Promise.all(promises);

    // -----------------------------
    // Save content and store clientRequestIdContent
    // -----------------------------
    await db.update(coursesTable)
      .set({
        courseContent: output,
        clientRequestIdContent: clientRequestId
      })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      courseName: courseTitle,
      CourseContent: output,
    });

  } catch (err) {
    console.error("❌ API ERROR:", err);
    return NextResponse.json({ error: "Failed to generate content", details: err.message }, { status: 500 });
  }
}

// SAFE JSON PARSER
function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    let fixed = str.replace(/,\s*([}\]])/g, "$1");
    const openCurly = (fixed.match(/{/g) || []).length;
    const closeCurly = (fixed.match(/}/g) || []).length;
    if (closeCurly < openCurly) fixed += "}".repeat(openCurly - closeCurly);
    const openArr = (fixed.match(/\[/g) || []).length;
    const closeArr = (fixed.match(/\]/g) || []).length;
    if (closeArr < openArr) fixed += "]".repeat(openArr - closeArr);
    return JSON.parse(fixed);
  }
}

// YOUTUBE API
const YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3/search";
async function GetYoutubeVideo(topic,courseName) {
  if (!process.env.YOUTUBE_API_KEY) return [];
  try {
    const params = {
      part: "snippet",
      q: `${topic} ${courseName} advanced tutorial only videos`,
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
