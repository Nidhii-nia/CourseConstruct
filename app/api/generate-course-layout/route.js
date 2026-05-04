import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
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
Rule - give 3 - 4 topics per chapter only
, User Input:  `;

// Groq client
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

if (typeof formData.includeVideo !== "boolean") {
  formData.includeVideo = false;
}

const user = await currentUser();
const { has } = await auth();

if (!user) {
  return NextResponse.json(
    { error: "Unauthorized - User not logged in" },
    { status: 401 }
  );
}

// --------------------------------------------------
// Check existing request
// --------------------------------------------------
const existing = await db
  .select()
  .from(coursesTable)
  .where(
    and(
      eq(coursesTable.clientRequestIdContent, clientRequestId),
      eq(coursesTable.isDeleted, false)
    )
  );

if (existing.length > 0) {
  return NextResponse.json({
    success: true,
    cid: existing[0].cid,
    course: existing[0].courseJson,
  });
}

// --------------------------------------------------
// Validation
// --------------------------------------------------
const sanitizedName = formData.name?.trim() || "";
const sanitizedNoOfChapters = parseInt(formData.noOfChapters ?? "0", 10);

if (!sanitizedName) {
  return NextResponse.json(
    { success: false, error: "Course name is required" },
    { status: 400 }
  );
}

// --------------------------------------------------
// Safe input
// --------------------------------------------------
const safeFormData = {
  name: sanitizedName,
  description: formData.description?.slice(0, 200) || "",
  category: formData.category || "",
  level: formData.level || "",
  includeVideo: formData.includeVideo,
  noOfChapters: sanitizedNoOfChapters,
};

// --------------------------------------------------
// Generate layouts
// --------------------------------------------------
const generateWithModel = async (model) => {
  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: PROMPT + JSON.stringify(safeFormData),
      },
    ],
    model,
    temperature: 1,
    max_completion_tokens: 2000,
  });

  const raw = completion.choices[0]?.message?.content || "";
  const match = raw.match(/\{[\s\S]*\}/);

  if (!match) throw new Error("Invalid JSON from AI");

  return JSON.parse(match[0]);
};

const [layoutA, layoutB] = await Promise.all([
  generateWithModel("openai/gpt-oss-120b"),
  generateWithModel("openai/gpt-oss-20b"),
]);

// --------------------------------------------------
// RETURN BOTH (NO SAVE)
// --------------------------------------------------
return NextResponse.json({
  success: true,
  layouts: [
    { id: "A", data: layoutA },
    { id: "B", data: layoutB },
  ],
});

} catch (err) {
console.error("Internal Error:", err);
return NextResponse.json(
{ error: "Internal Server Error", details: err.message },
{ status: 500 }
);
}
}


// // --------------------------------------------------
// // HuggingFace Image Generation
// // --------------------------------------------------
// const GenerateImage = async (prompt) => {
//   try {
//     const hf = new InferenceClient(process.env.HF_TOKEN);
//     const response = await hf.textToImage({
//       model: "stabilityai/stable-diffusion-xl-base-1.0",
//       inputs: prompt,
//       parameters: { width: 768, height: 432, num_inference_steps: 30 },
//     });

//     if (response?.blob) {
//       const buffer = Buffer.from(await response.blob());
//       return `data:image/png;base64,${buffer.toString("base64")}`;
//     } else if (response?.arrayBuffer) {
//       const buffer = Buffer.from(await response.arrayBuffer());
//       return `data:image/png;base64,${buffer.toString("base64")}`;
//     } else if (response instanceof Buffer) {
//       return `data:image/png;base64,${response.toString("base64")}`;
//     } else {
//       return response?.base64
//         ? `data:image/png;base64,${response.base64}`
//         : "/books.png";
//     }
//   } catch (err) {
//     console.error("Image generation failed for prompt:", prompt, err);
//     return "/books.png";
//   }
// };