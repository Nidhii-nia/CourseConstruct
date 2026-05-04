import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const showDeleted = searchParams.get("showDeleted") === "true";
    let user = null;

    try {
      user = await currentUser();
    } catch (err) {
      console.error("Clerk error:", err);
    }

    let result = [];

    // 🔹 CASE 1: Fetch ALL courses (filters isDeleted = false)
    if (courseId === "0") {
      result = await db
        .select({
          cid: coursesTable.cid,
          name: coursesTable.name,
          bannerImgUrl: coursesTable.bannerImgUrl,
          noOfChapters: coursesTable.noOfChapters,
          hasContent: coursesTable.hasContent,
          isPublished: coursesTable.isPublished,
          courseJson: coursesTable.courseJson,
        })
        .from(coursesTable)
        .where(
          and(
            eq(coursesTable.hasContent, false),
            eq(coursesTable.isDeleted, false),
          ),
        )
        .orderBy(desc(coursesTable.id))
        .limit(50);
    }

    // 🔹 CASE 2: Fetch specific course (filters isDeleted = false)
    else if (courseId) {
      result = await db
        .select({
          cid: coursesTable.cid,
          name: coursesTable.name,
          bannerImgUrl: coursesTable.bannerImgUrl,
          noOfChapters: coursesTable.noOfChapters,
          hasContent: coursesTable.hasContent,
          isPublished: coursesTable.isPublished,
          courseJson: coursesTable.courseJson,
        })
        .from(coursesTable)
        .where(
          and(
            eq(coursesTable.cid, courseId),
            eq(coursesTable.isDeleted, false),
          ),
        )
        .limit(1);
    }

    // 🔹 CASE 3: Fetch user courses (with showDeleted support)
    else {
      const email = user?.primaryEmailAddress?.emailAddress;

      if (!email) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 401 },
        );
      }

      // Build query based on showDeleted parameter
      if (showDeleted) {
        // Include both deleted and active courses
        const data = await db.execute(sql`
          SELECT 
            c."cid",
            c."name",
            c."bannerImgUrl",
            c."noOfChapters",
            c."hasContent",
            c."isDeleted",
            c."isPublished",
            c."courseJson"->'course'->>'description' AS description

          FROM ${coursesTable} c
          WHERE c."useremail" = ${email}
          ORDER BY c."id" DESC
          LIMIT 20
        `);
        result = data.rows;
      } else {
        // Only active courses
        const data = await db.execute(sql`
          SELECT 
            c."cid",
            c."name",
            c."bannerImgUrl",
            c."noOfChapters",
            c."hasContent",
            c."isDeleted",
            c."isPublished",
            c."courseJson"->'course'->>'description' AS description

          FROM ${coursesTable} c
          WHERE c."useremail" = ${email}
          AND c."isDeleted" = false
          ORDER BY c."id" DESC
          LIMIT 20
        `);
        result = data.rows;
      }
    }

    return NextResponse.json({
      success: true,
      courses: result || [],
    });
  } catch (error) {
    console.error("Error fetching courses:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 },
    );
  }
}