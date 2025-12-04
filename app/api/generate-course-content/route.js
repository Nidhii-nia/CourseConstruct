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

    // Validate
    if (!courseId || !clientRequestId || !courseJson?.chapters) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if already generated
    const existing = await db.select().from(coursesTable)
      .where(eq(coursesTable.clientRequestIdContent, clientRequestId));

    if (existing.length > 0) {
      return NextResponse.json({
        courseName: courseTitle,
        CourseContent: existing[0].courseContent
      });
    }

    // Generate content for each chapter
    const chapterPromises = courseJson.chapters.map(async (chapter) => {
      try {
        // Get AI content
        const response = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: [{ role: "user", parts: [{ text: PROMPT + JSON.stringify(chapter) }] }]
        });

        const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || "";
        const jsonText = rawText.replace(/```json|```/g, "").trim();
        
        // Simple JSON parse with fallback
        let courseData;
        try {
          courseData = JSON.parse(jsonText);
        } catch {
          // If JSON fails, create basic structure
          courseData = {
            chapterName: chapter.chapterName || "Chapter",
            topics: [{
              topic: "Main Topic",
              content: `<div><h2>${chapter.chapterName}</h2><p>Content for this chapter.</p></div>`
            }]
          };
        }

        // Get YouTube videos
        const youtubeVideo = await GetYoutubeVideo(chapter?.chapterName, courseJson?.course?.name);

        return {
          youtubeVideo,
          courseData
        };
      } catch (error) {
        console.error(`Error in chapter "${chapter.chapterName}":`, error);
        return {
          youtubeVideo: [],
          courseData: {
            chapterName: chapter.chapterName,
            topics: [{
              topic: "Error",
              content: "<div><p>Failed to generate content.</p></div>"
            }]
          }
        };
      }
    });

    const output = await Promise.all(chapterPromises);

    // Save to database
    await db.update(coursesTable)
      .set({
        courseContent: output,
        hasContent:true,
        clientRequestIdContent: clientRequestId
      })
      .where(eq(coursesTable.cid, courseId));

    return NextResponse.json({
      success: true,
      courseName: courseTitle,
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ 
      error: "Internal server error",
      message: error.message 
    }, { status: 500 });
  }
}

// YouTube API
async function GetYoutubeVideo(topic, courseName) {
  if (!process.env.YOUTUBE_API_KEY) return [];

  try {
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: `${topic} ${courseName} full course`,
        maxResults: 4,
        type: "video",
        key: process.env.YOUTUBE_API_KEY,
      }
    });

    return (response.data.items || []).map(item => ({
      videoId: item.id?.videoId,
      title: item.snippet?.title,
    }));
  } catch {
    return [];
  }
}