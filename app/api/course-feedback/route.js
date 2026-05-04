import { db } from "@/config/db";
import { courseFeedbackTable } from "@/config/schema";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const { cid, useremail, rating, feedback } = body;

    if (!cid || !useremail || !rating) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await db.insert(courseFeedbackTable).values({
      cid,
      useremail,
      rating,
      feedback,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}