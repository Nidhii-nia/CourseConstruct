import { NextResponse } from "next/server";
import { db } from "@/config/db";
import {
  coursesTable,
  enrollCourseTable,
} from "@/config/schema";
import { sql } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {

    // ==================================================
    // 🔐 AUTH
    // ==================================================

const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail =
      user.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // ==================================================
    // 🚀 OPTIMIZED QUERY
    // ==================================================

    const result = await db.execute(sql`
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

      WHERE
        c."isDeleted" = false
        AND c."hasContent" = true
        AND c."isPublished" = true

        AND NOT EXISTS (
          SELECT 1
          FROM ${enrollCourseTable} ec

          WHERE
            ec."cid" = c."cid"
            AND ec."useremail" = ${userEmail}
        )

      ORDER BY c."id" DESC
      LIMIT 50
    `);

    // ==================================================
    // ✅ RESPONSE
    // ==================================================

    return NextResponse.json({
      courses: result.rows || [],
    });

  } catch (error) {
    console.error("Explore API Error:", error);

    return NextResponse.json(
      {
        error:
          error?.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}