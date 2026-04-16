import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { Groq } from "groq-sdk";

// Initialize Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// PROMPT (unchanged)
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

CRITICAL RULES:
- Output MUST be strictly valid JSON
- Do NOT include any text before or after JSON
- Do NOT include \`\`\`
- Ensure all keys use double quotes
- Ensure JSON.parse() works without errors

Rules:
- Do NOT add duration
- Do NOT add extra keys
- Only return JSON
- "content" must be valid HTML wrapped in a single <div> ... </div>

User Input:
`;

// SAFE JSON PARSER
function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    console.warn("JSON parse failed, attempting fix...");

    try {
      let fixed = text
        .replace(/```json|```/g, "")
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]");

      return JSON.parse(fixed);
    } catch {
      return null;
    }
  }
}

// ✅ NEW: Extract JSON safely
function extractJson(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return safeJsonParse(match[0]);
  } catch {
    return null;
  }
}

// Retry helper (ONLY token change)
async function generateWithRetry(messages, retries = 2) {
  try {
    return await groq.chat.completions.create({
      messages,
      model: "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 7000, // ✅ increased slightly
      top_p: 1,
    });
  } catch (error) {
    if (retries > 0) {
      console.warn("Retrying with lower tokens...");
      return await groq.chat.completions.create({
        messages,
        model: "openai/gpt-oss-120b",
        temperature: 1,
        max_completion_tokens: 8000,
        top_p: 1,
      });
    }
    throw error;
  }
}

export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId, clientRequestId } =
      await req.json();

    if (!courseId || !clientRequestId || !courseJson?.chapters) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.clientRequestIdContent, clientRequestId));

    if (existing.length > 0) {
      return NextResponse.json({
        courseName: courseTitle,
        CourseContent: existing[0].courseContent,
      });
    }

    const output = [];

    // 🔥 CHAPTER LOOP
    for (const chapter of courseJson.chapters) {
      try {
        const messages = [
          {
            role: "user",
            content:
              PROMPT +
              JSON.stringify({
                chapterName: chapter.chapterName,
                topics: chapter.topics.slice(0, 3), // ✅ LIMIT FIX
              }),
          },
        ];

        const chatCompletion = await generateWithRetry(messages);

        const raw =
          chatCompletion.choices?.[0]?.message?.content || "";

        console.log("RAW AI OUTPUT:", raw);

        // ✅ SAFE PARSE
        let parsed = extractJson(raw);

        // ✅ NO THROW — SAFE FALLBACK
        if (!parsed || !parsed.topics) {
          console.warn("Invalid AI response, using fallback");

          parsed = {
            chapterName: chapter.chapterName,
            topics: chapter.topics.map((t) => ({
              topic: t.topic,
              content:
                "<div><p>Content generation failed. Retry recommended.</p></div>",
            })),
          };
        }

        const youtubeVideo = await GetYoutubeVideo(
          chapter.chapterName,
          courseJson?.course?.name,
          4
        );

        output.push({
          youtubeVideo,
          courseData: parsed,
        });

        await new Promise((r) => setTimeout(r, 12000));

      } catch (err) {
        console.error("Chapter error:", chapter.chapterName, err);

        output.push({
          youtubeVideo: [],
          courseData: {
            chapterName: chapter.chapterName,
            topics: chapter.topics.map((t) => ({
              topic: t.topic,
              content:
                "<div><p>Failed to generate content.</p></div>",
            })),
          },
        });
      }
    }

    await db
      .update(coursesTable)
      .set({
        courseContent: output,
        hasContent: true,
        clientRequestIdContent: clientRequestId,
      })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      success: true,
      courseName: courseTitle,
    });

  } catch (error) {
    console.error("API Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// ================= YOUTUBE FUNCTION =================
async function GetYoutubeVideo(topic, courseName, maxPerChapter) {
  if (!process.env.YOUTUBE_API_KEY) return [];

  const baseQuery = `${topic} ${courseName} tutorial lecture explained`;

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: baseQuery,
          maxResults: 8,
          type: "video",
          videoDuration: "medium",
          relevanceLanguage: "en",
          safeSearch: "strict",
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    let videos = (response.data.items || []).filter((item) => {
      const title = item.snippet?.title?.toLowerCase() || "";

      return (
        !title.includes("short") &&
        !title.includes("reel") &&
        !title.includes("status") &&
        !title.includes("clip") &&
        !title.includes("#shorts") &&
        !title.includes("trailer")
      );
    });

    if (videos.length === 0) {
      const fallback = await axios.get(
        "https://www.googleapis.com/youtube/v3/search",
        {
          params: {
            part: "snippet",
            q: `${topic} explained`,
            maxResults: 6,
            type: "video",
            videoDuration: "medium",
            key: process.env.YOUTUBE_API_KEY,
          },
        }
      );

      videos = fallback.data.items || [];
    }

    return videos.slice(0, maxPerChapter || 4).map((item) => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
    }));

  } catch (err) {
    console.error("YouTube fetch error:", err);
    return [];
  }
}