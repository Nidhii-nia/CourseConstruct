import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";

import {
  currentUser,
} from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

import { v4 as uuid4 } from "uuid";

import {
  InferenceClient,
} from "@huggingface/inference";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

// ======================================================
// 🤖 SINGLE HF CLIENT INSTANCE
// ======================================================

const hf = new InferenceClient(
  process.env.HF_TOKEN
);

// ======================================================
// 🖼️ IMAGE GENERATOR
// ======================================================

const GenerateImage = async (prompt) => {

  try {

    const response =
      await hf.textToImage({

        model:
          "stabilityai/stable-diffusion-xl-base-1.0",

        inputs: prompt,

        parameters: {
          width: 768,
          height: 432,
          num_inference_steps: 30,
        },
      });

    // ==================================================
    // ✅ BLOB RESPONSE
    // ==================================================

    if (response?.blob) {

      const buffer = Buffer.from(
        await response.blob()
      );

      return `data:image/png;base64,${buffer.toString(
        "base64"
      )}`;
    }

    // ==================================================
    // ✅ ARRAY BUFFER RESPONSE
    // ==================================================

    if (response?.arrayBuffer) {

      const buffer = Buffer.from(
        await response.arrayBuffer()
      );

      return `data:image/png;base64,${buffer.toString(
        "base64"
      )}`;
    }

    return "/books.png";

  } catch (err) {

    console.error(
      "Image generation failed:",
      err
    );

    return "/books.png";
  }
};

// ======================================================
// 🚀 POST
// ======================================================

export async function POST(req) {

  try {

    // ==================================================
    // 🔐 AUTH
    // ==================================================

    const user =
      await currentUser();

    if (!user) {

      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail =
      user.primaryEmailAddress
        ?.emailAddress;

    if (!userEmail) {

      return NextResponse.json(
        {
          error:
            "User email not found",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // 📦 BODY
    // ==================================================

    const body =
      await req.json();

    const {
      layout,
      formData,
    } = body;

    if (
      !layout ||
      !formData
    ) {

      return NextResponse.json(
        {
          error:
            "Layout and formData are required",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // 🆔 COURSE ID
    // ==================================================

    const cid = uuid4();

    // ==================================================
    // 🖼️ BANNER PROMPT
    // ==================================================

    const bannerPrompt =

      layout?.course
        ?.bannerImagePrompt ||

      "3D flat-style UI/UX design, vibrant colors";

    // ==================================================
    // 🚀 GENERATE IMAGE
    // ==================================================

    const bannerImgUrl =
      await GenerateImage(
        bannerPrompt
      );

    // ==================================================
    // 💾 SAVE COURSE
    // ==================================================

    await db
      .insert(coursesTable)
      .values({

        cid,

        ...formData,

        courseJson:
          layout,

        useremail:
          userEmail,

        bannerImgUrl,
      });

    // ==================================================
    // ✅ RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,
      cid,
    });

  } catch (err) {

    console.error(
      "Save Course Error:",
      err
    );

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed to save course",
      },

      { status: 500 }
    );
  }
}