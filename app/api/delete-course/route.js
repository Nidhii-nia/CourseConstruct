import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function DELETE(req) {
  try {
    // ✅ AUTH CHECK
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { courseId } = await req.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Safely extract user email
    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // ✅ Only delete own course
    const result = await db
      .update(coursesTable)
      .set({ isDeleted: true })
      .where(
        and(
          eq(coursesTable.cid, courseId),
          eq(coursesTable.useremail, userEmail),
          eq(coursesTable.isDeleted, false)
        )
      );

    // Check if any rows were actually updated
    if (!result || result.changes === 0) {
      return NextResponse.json(
        { error: "Course not found or already deleted" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });

  } catch (error) {
    console.error("Delete Error:", error);

    return NextResponse.json(
      { error: "Failed to delete course" },
      { status: 500 }
    );
  }
}