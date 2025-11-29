import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { desc, eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req) {
  try {
    const headers = new Headers();
    headers.set("Cache-Control", "no-store, max-age=0");

    const { searchParams } = new URL(req.url);
    const courseId = searchParams?.get("courseId");
    const user = await currentUser();

    let result;

    if (courseId) {
      console.log("🔍 Fetching course with ID:", courseId);
      result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.cid, courseId));
    } else {
      // Fetch all courses of the current user
      result = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.useremail, user.primaryEmailAddress?.emailAddress))
        .orderBy(desc(coursesTable.id));
    }

    console.log("🔹 Query result:", result);

    if (!result || result.length === 0) {
      return NextResponse.json(
        { success: false, error: "No courses found" },
        { status: 404, headers }
      );
    }

    // Make sure every courseContent is an array (not {}, null, or undefined)
    const normalizedResult = result.map(course => ({
      ...course,
      courseContent: Array.isArray(course.courseContent)
        ? course.courseContent
        : [],
    }));
    console.log("API Normalized Response:", normalizedResult);

    return NextResponse.json(
      {
        success: true,
        message: "Courses fetched successfully",
        courses: normalizedResult,
      },
      { status: 200, headers }
    );
  } catch (error) {
    console.error("❌ Error fetching courses:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export function POST() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
