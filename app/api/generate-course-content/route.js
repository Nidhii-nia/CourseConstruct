import { NextResponse } from "next/server";
import axios from "axios";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq } from "drizzle-orm";
import { Groq } from "groq-sdk";

// ======================================================
//  GROQ CLIENT
// ======================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// ======================================================
//  PROMPT
// ======================================================

const TOPIC_PROMPT = `
You are an expert textbook author.

Return ONLY valid JSON:

{
"topic": "",
"content": "<div>HTML</div>"
}

Write detailed educational HTML content for students.

Requirements:

* Textbook-quality explanation
* Give review questions with answer
* Deep conceptual clarity
* Include examples and applications
* Include formulas if needed
* Use headings, lists, tables where useful
* Avoid filler and repetition
* Complete all explanations fully
* Keep HTML clean and semantic
* One root <div>
- Be concise but complete

Math format:
Inline: \( ... \)
Block: \[ ... \]

Topic:
`;

// ======================================================
//  DELAY
// ======================================================

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ======================================================
//  CLEAN MATH CONTENT
// ======================================================

function cleanMathContent(content) {
  if (!content) return content;

  return (
    content
      // Fix common LaTeX escaping issues
      .replace(/\\\(/g, "\\(")
      .replace(/\\\)/g, "\\)")
      .replace(/\\\[/g, "\\[")
      .replace(/\\\]/g, "\\]")
      // Ensure proper spacing around math delimiters
      .replace(/([^\\])\\(\[|\()/g, "$1 \\$2")
      .replace(/(\\\]|\\\))([^\\])/g, "$1 $2")
      // Fix double-escaped display math
      .replace(/\\\\\\\[/g, "\\[")
      .replace(/\\\\\\\]/g, "\\]")
      // Fix cases where $ is escaped
      .replace(/\\\$/g, "$")
      // Fix inconsistent display math formatting
      .replace(/\$\$\s*\n\s*([\s\S]*?)\s*\n\s*\$\$/g, (_, math) => {
        return `$$\n${math.trim()}\n$$`;
      })
      // Convert \displaystyle to proper display math
      .replace(/\\displaystyle/g, "")
  );
}

// ======================================================
//  SAFE JSON PARSER
// ======================================================

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    try {
      let fixed = text
        .replace(/```json|```/g, "")
        .replace(/(\r\n|\n|\r)/gm, " ")
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .trim();

      return JSON.parse(fixed);
    } catch (err) {
      console.error(" JSON Parse Failed:", err);
      return null;
    }
  }
}

// ======================================================
//  EXTRACT JSON
// ======================================================

function extractJson(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1) {
      return null;
    }

    const jsonString = cleaned.slice(firstBrace, lastBrace + 1);

    return safeJsonParse(jsonString);
  } catch (e) {
    console.error(" Extract JSON Error:", e);
    return null;
  }
}

// ======================================================
//  VALIDATION
// ======================================================

function isValidTopicResponse(parsed) {
  return (
    parsed &&
    typeof parsed === "object" &&
    typeof parsed.topic === "string" &&
    typeof parsed.content === "string" &&
    parsed.content.includes("<div")
  );
}

// ======================================================
//  TIMEOUT WRAPPER
// ======================================================

function withTimeout(promise, ms = 45000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), ms),
    ),
  ]);
}

// ======================================================
//  GENERATE SINGLE TOPIC
// ======================================================

async function generateTopic(topicName, chapterName, courseTitle) {
  const messages = [
    {
      role: "user",
      content:
        TOPIC_PROMPT +
        JSON.stringify({
          courseTitle,
          chapterName,
          topic: topicName,
        }),
    },
  ];

  const completion = await withTimeout(
    groq.chat.completions.create({
      messages,

      model: "openai/gpt-oss-120b",

      temperature: 0.4,

      max_completion_tokens: 3500,

      top_p: 1,
    }),
    45000,
  );

  const raw = completion?.choices?.[0]?.message?.content || "";

  console.log(` RAW TOPIC RESPONSE (${topicName}):`, raw);

  // ======================================================
  //  TRUNCATION CHECK
  // ======================================================

  const parsed = extractJson(raw);

  if (!parsed) {
    console.warn(` Invalid or truncated JSON`);
    return null;
  }

  return parsed;
}

// ======================================================
//  RETRY GENERATION
// ======================================================

async function generateTopicWithRetry(
  topicName,
  chapterName,
  courseTitle,
  maxRetries = 3,
) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(` Generating Topic: ${topicName} | Attempt ${attempt}`);

      const parsed = await generateTopic(topicName, chapterName, courseTitle);

      // ======================================================
      //  VALID RESPONSE
      // ======================================================

      if (isValidTopicResponse(parsed)) {
        // ✅ APPLY MATH CLEANING BEFORE RETURNING
        return {
          topic: parsed.topic,
          content: cleanMathContent(parsed.content),
        };
      }

      console.warn(` Invalid AI response for topic: ${topicName}`);
    } catch (error) {
      console.error(
        ` Retry ${attempt} failed for topic: ${topicName}`,
        error.message,
      );
    }

    // ======================================================
    //  BACKOFF
    // ======================================================

    await delay(4000 * attempt);
  }

  // ======================================================
  // 🚨 LAST ATTEMPT FALLBACK
  // ======================================================

  try {
    console.log(` Final recovery attempt for: ${topicName}`);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content:
            TOPIC_PROMPT +
            JSON.stringify({
              courseTitle,
              chapterName,
              topic: topicName,
            }),
        },
      ],

      model: "openai/gpt-oss-120b",

      temperature: 0.3,

      max_completion_tokens: 3000,

      top_p: 1,
    });

    const raw = completion?.choices?.[0]?.message?.content || "";

    const parsed = extractJson(raw);

    if (isValidTopicResponse(parsed)) {
      // ✅ APPLY MATH CLEANING TO FALLBACK CONTENT
      return {
        topic: parsed.topic,
        content: cleanMathContent(parsed.content),
      };
    }
  } catch (err) {
    console.error(" Final recovery failed:", err.message);
  }

  // ======================================================
  //  NO FAILED CONTENT
  // ======================================================

  return {
    topic: topicName,

    content: `
      <div>
        <h2>${topicName}</h2>
        <p>
          Detailed educational content for this topic is currently being generated.
        </p>
      </div>
    `,
  };
}

// ======================================================
//  YOUTUBE FUNCTION
// ======================================================

async function GetYoutubeVideo(topic, courseName, maxPerChapter = 4) {
  if (!process.env.YOUTUBE_API_KEY) {
    console.error("YOUTUBE_API_KEY is not set in environment variables");
    return {
      videos: [],
      playlists: [],
    };
  }

  // Create a better search query
  const searchQuery = `
${courseName}
${topic}
full course tutorial
`.trim();

  console.log(`Searching YouTube for: "${searchQuery}"`);

  try {
    // ======================================================
    // FETCH VIDEOS
    // ======================================================

    const videoResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: searchQuery,
          maxResults: 15,
          type: "video",
          videoDuration: "medium",
          relevanceLanguage: "en",
          order: "relevance",
          safeSearch: "strict",
          key: process.env.YOUTUBE_API_KEY,
        },
      },
    );

    console.log(`YouTube API Response Status: ${videoResponse.status}`);
    console.log(`Found ${videoResponse?.data?.items?.length || 0} videos`);

    // ======================================================
    // FETCH PLAYLISTS
    // ======================================================

    const playlistResponse = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: searchQuery,
          maxResults: 5,
          type: "playlist",
          relevanceLanguage: "en",
          order: "relevance",
          safeSearch: "strict",
          key: process.env.YOUTUBE_API_KEY,
        },
      },
    );

    console.log(
      `Found ${playlistResponse?.data?.items?.length || 0} playlists`,
    );

    // ======================================================
    // FILTER LOW QUALITY CONTENT
    // ======================================================

    const blockedWords = [
      "short",
      "#shorts",
      "reel",
      "status",
      "clip",
      "trailer",
      "meme",
      "edit",
      "reaction",
      "live",
    ];

    const cleanVideos = (videoResponse?.data?.items || []).filter((item) => {
      const title = item?.snippet?.title?.toLowerCase() || "";
      const isValid = !blockedWords.some((word) => title.includes(word));
      return isValid;
    });

    // ======================================================
    // FORMAT VIDEOS
    // ======================================================

    const videos = cleanVideos
      .filter((video) => video.videoId && video.title && video.thumbnail)
      .slice(0, maxPerChapter)
      .map((item) => ({
        type: "video",
        videoId: item?.id?.videoId || "",
        title: item?.snippet?.title || "Untitled Video",
        thumbnail:
          item?.snippet?.thumbnails?.high?.url ||
          item?.snippet?.thumbnails?.medium?.url ||
          item?.snippet?.thumbnails?.default?.url ||
          "",
        channelTitle: item?.snippet?.channelTitle || "Unknown Channel",
        meta: `${item?.snippet?.channelTitle} • ${new Date(item?.snippet?.publishedAt).getFullYear()}`,
      }));

    // ======================================================
    // FORMAT PLAYLISTS
    // ======================================================

    const playlists = (playlistResponse?.data?.items || [])
      .filter((item) => {
        const title = item?.snippet?.title?.toLowerCase() || "";
        return !blockedWords.some((word) => title.includes(word));
      })
      .slice(0, 3)
      .map((item) => ({
        type: "playlist",
        playlistId: item?.id?.playlistId || "",
        title: item?.snippet?.title || "Untitled Playlist",
        thumbnail:
          item?.snippet?.thumbnails?.high?.url ||
          item?.snippet?.thumbnails?.medium?.url ||
          item?.snippet?.thumbnails?.default?.url ||
          "",
        channelTitle: item?.snippet?.channelTitle || "Unknown Channel",
      }));

    console.log(
      `Returning ${videos.length} videos and ${playlists.length} playlists`,
    );

    return {
      videos,
      playlists,
    };
  } catch (err) {
    console.error("YouTube fetch error details:", {
      message: err?.message,
      response: err?.response?.data,
      status: err?.response?.status,
    });

    return {
      videos: [],
      playlists: [],
    };
  }
}

// ======================================================
//  API
// ======================================================

export async function POST(req) {
  try {
    const { courseJson, courseTitle, courseId, clientRequestId, includeVideo } =
      await req.json();

    console.log(" API Received - includeVideo:", includeVideo);
    console.log("Type:", typeof includeVideo);
    console.log("Course Title:", courseTitle);

    // ======================================================
    //  VALIDATION
    // ======================================================

    if (!courseId || !clientRequestId || !courseJson?.chapters) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 },
      );
    }

    // ======================================================
    //  DUPLICATE REQUEST CHECK
    // ======================================================

    const existing = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.clientRequestIdContent, clientRequestId));

    if (existing.length > 0) {
      return NextResponse.json({
        success: true,
        cached: true,
        courseName: courseTitle,
        CourseContent: existing[0].courseContent,
      });
    }

    // ======================================================
    // 📦 OUTPUT
    // ======================================================

    const output = [];

    // ======================================================
    // 📚 CHAPTER LOOP
    // ======================================================

    for (const chapter of courseJson.chapters) {
      console.log(` Processing Chapter: ${chapter.chapterName}`);

      const generatedTopics = [];

      // ======================================================
      //  TOPIC LOOP
      // ======================================================

      for (const topicItem of chapter.topics || []) {
        const topicName =
          typeof topicItem === "string"
            ? topicItem
            : topicItem?.topic || "Untitled Topic";

        // ======================================================
        //  TOPIC-WISE RETRY GENERATION
        // ======================================================

        const generated = await generateTopicWithRetry(
          topicName,
          chapter.chapterName,
          courseTitle,
        );

        generatedTopics.push({
          topic: generated.topic,
          content: generated.content,
        });

        // ======================================================
        //  SMALL DELAY
        // ======================================================

        await delay(500);
      }

      // ======================================================
      //  OPTIONAL YOUTUBE
      // ======================================================

      let youtubeContent = {
        videos: [],
        playlists: [],
      };

      console.log(
        `🎬 Chapter: ${chapter.chapterName}, includeVideo value:`,
        includeVideo,
      );

      const shouldIncludeVideo =
        includeVideo === true || includeVideo === "true";

      if (shouldIncludeVideo) {
        console.log(`🎬 FETCHING videos for: ${chapter.chapterName}`);
        youtubeContent = await GetYoutubeVideo(
          chapter.chapterName,
          courseTitle,
          4,
        );
        console.log(`🎬 Fetched ${youtubeContent.videos.length} videos`);
      } else {
        console.log(`🎬 SKIPPING videos for: ${chapter.chapterName}`); // ✅ ADD THIS
      }

      // ======================================================
      // 📦 PUSH CHAPTER
      // ======================================================

      output.push({
        youtubeContent,

        courseData: {
          chapterName: chapter.chapterName,

          topics: generatedTopics,
        },
      });
      console.log(
        `🎬 Saved chapter with ${youtubeContent.videos.length} videos`,
      );

      // ======================================================
      //  CHAPTER DELAY
      // ======================================================

      await delay(500);
    }

    // ======================================================
    // 💾 SAVE TO DB
    // ======================================================

    await db
      .update(coursesTable)
      .set({
        courseContent: output,

        hasContent: true,

        clientRequestIdContent: clientRequestId,
      })
      .where(eq(coursesTable.cid, courseId));

    // ======================================================
    //  RESPONSE
    // ======================================================

    return NextResponse.json({
      success: true,
      courseName: courseTitle,
      chaptersGenerated: output.length,
    });
  } catch (error) {
    console.error(" API Error:", error);

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
