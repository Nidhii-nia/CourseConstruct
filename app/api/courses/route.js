import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { desc, eq } from "drizzle-orm";

export async function GET(req) {
  try {
    const headers = new Headers();
    headers.set("Cache-Control", "no-store, max-age=0");

    const { searchParams } = new URL(req.url);
    const courseId = searchParams?.get("courseId");
    const user = await currentUser();

    let result;

    // Handle courseId=0 case - return ALL courses
    if (courseId === "0") {
      console.log("🔍 Fetching ALL courses (courseId=0)");
      result = await db
        .select({
          cid: coursesTable.cid,
          name: coursesTable.name,
          bannerImgUrl: coursesTable.bannerImgUrl,
          noOfChapters: coursesTable.noOfChapters,
          hasContent: coursesTable.hasContent,
          courseJson: coursesTable.courseJson,
        })
        .from(coursesTable)
          .where(eq(coursesTable.hasContent, false)) 
        .orderBy(desc(coursesTable.id))
        .limit(50); // Limit to prevent too many results
    } 
    // Handle specific courseId
    else if (courseId) {
      result = await db
        .select({
          cid: coursesTable.cid,
          name: coursesTable.name,
          bannerImgUrl: coursesTable.bannerImgUrl,
          noOfChapters: coursesTable.noOfChapters,
          hasContent: coursesTable.hasContent,
          courseJson: coursesTable.courseJson,
        })
        .from(coursesTable)
        .where(eq(coursesTable.cid, courseId))
        .limit(1);
    } 
    // No courseId provided - fetch current user's courses
    else {
      if (!user?.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
      }

      result = await db
        .select({
          cid: coursesTable.cid,
          name: coursesTable.name,
          bannerImgUrl: coursesTable.bannerImgUrl,
          noOfChapters: coursesTable.noOfChapters,
          hasContent: coursesTable.hasContent,
          courseJson: coursesTable.courseJson,
        })
        .from(coursesTable)
        .where(eq(coursesTable.useremail, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(coursesTable.id))
        .limit(20);
    }

    return NextResponse.json({
      success: true,
      courses: result || [],
    }, { headers });

  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}