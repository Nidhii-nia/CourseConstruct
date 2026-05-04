import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { v4 as uuid4 } from "uuid";
import { InferenceClient } from "@huggingface/inference";

// HuggingFace Image Generator
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
}

if (response?.arrayBuffer) {
  const buffer = Buffer.from(await response.arrayBuffer());
  return `data:image/png;base64,${buffer.toString("base64")}`;
}

return "/books.png"

} catch (err) {
console.error("Image generation failed:", err);
return "/books.png";
}
};

export async function POST(req) {
try {
const { layout, formData } = await req.json();
const user = await currentUser();
if (!user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

const cid = uuid4();

// 🔥 Extract prompt from layout
const bannerPrompt =
  layout?.course?.bannerImagePrompt ||
  "3D flat-style UI/UX design, vibrant colors";

// 🔥 Generate image HERE (correct place)
const bannerImgUrl = await GenerateImage(bannerPrompt);

// Save to DB
await db.insert(coursesTable).values({
  cid,
  ...formData,
  courseJson: layout,
  useremail: user?.primaryEmailAddress?.emailAddress,
  bannerImgUrl,
});

return NextResponse.json({ success: true, cid })

} catch (err) {
console.error(err);
return NextResponse.json(
{ error: "Failed to save course" },
{ status: 500 }
);
}
}
