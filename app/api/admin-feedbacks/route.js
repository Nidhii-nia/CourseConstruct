import { db } from "@/config/db";
import { courseFeedbackTable } from "@/config/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const reports = await db
      .select({
        id: courseFeedbackTable.id,
        user: courseFeedbackTable.useremail,
        message: courseFeedbackTable.feedback,
        rating: courseFeedbackTable.rating,
        createdAt: courseFeedbackTable.createdAt,
      })
      .from(courseFeedbackTable)
      .orderBy(desc(courseFeedbackTable.createdAt));

    return NextResponse.json({ reports: reports || [] });
  } catch (err) {
    console.error("Reports Error:", err);

    return NextResponse.json(
      { error: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}