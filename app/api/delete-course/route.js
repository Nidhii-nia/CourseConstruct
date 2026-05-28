import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";

export const runtime = "nodejs";

export async function DELETE(req) {
  try {

    // ==================================================
    // 🔐 AUTH
    // ==================================================

    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }


    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // ==================================================
    // 📦 BODY
    // ==================================================

    const body = await req.json();

    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // ==================================================
    // 📧 USER EMAIL
    // ==================================================

    const userEmail =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses?.[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // ==================================================
    // 🚀 SOFT DELETE
    // ==================================================

    const result = await db
      .update(coursesTable)
      .set({
        isDeleted: true,
      })
      .where(
        and(
          eq(coursesTable.cid, courseId),
          eq(coursesTable.useremail, userEmail),
          eq(coursesTable.isDeleted, false)
        )
      )
      .returning({
        cid: coursesTable.cid,
      });

    // ==================================================
    // ❌ NOT FOUND
    // ==================================================

    if (!result.length) {
      return NextResponse.json(
        {
          error:
            "Course not found or already deleted",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // ✅ RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
      cid: result[0].cid,
    });

  } catch (error) {
    console.error("Delete Error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Failed to delete course",
      },
      { status: 500 }
    );
  }
}