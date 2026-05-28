import { NextResponse } from "next/server";
import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";
import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { desc, eq, and, sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ======================================================
// 📦 COMMON SELECT FIELDS
// ======================================================

const COURSE_FIELDS = {
  cid: coursesTable.cid,
  name: coursesTable.name,
  bannerImgUrl: coursesTable.bannerImgUrl,
  noOfChapters: coursesTable.noOfChapters,
  hasContent: coursesTable.hasContent,
  isPublished: coursesTable.isPublished,

  description: sql`
    ${coursesTable.courseJson}
    -> 'course'
    ->> 'description'
  `.as("description"),
};

// ======================================================
// 🚀 API
// ======================================================

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const courseId = searchParams.get("courseId");
    const showDeleted =
      searchParams.get("showDeleted") === "true";

    // ==================================================
    // 🔹 CASE 1: FETCH ALL COURSES
    // ==================================================

    if (courseId === "0") {
      const result = await db
        .select(COURSE_FIELDS)
        .from(coursesTable)
        .where(
          and(
            eq(coursesTable.hasContent, false),
            eq(coursesTable.isDeleted, false)
          )
        )
        .orderBy(desc(coursesTable.id))
        .limit(50);

      return NextResponse.json({
        success: true,
        courses: result || [],
      });
    }

    // ==================================================
    // 🔹 CASE 2: FETCH SINGLE COURSE
    // ==================================================

if (courseId) {

  const result = await db

    .select()

    .from(coursesTable)

    .where(
      and(

        eq(
          coursesTable.cid,
          courseId
        ),

        eq(
          coursesTable.isDeleted,
          false
        )
      )
    )

    .limit(1);

  return NextResponse.json({

    success: true,

    courses:
      result || [],
  });
}

    // ==================================================
    // 🔹 CASE 3: USER COURSES
    // ==================================================

const { userId } = await auth();

if (!userId) {
  return NextResponse.json(
    {
      success: false,
      error: "Unauthorized",
    },
    { status: 401 }
  );
}

const user = await currentUser();

const email =
  user?.primaryEmailAddress
    ?.emailAddress;

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    // ==================================================
    // ⚡ OPTIMIZED RAW QUERY
    // ==================================================

    const deletedCondition = showDeleted
      ? sql``
      : sql`AND c."isDeleted" = false`;

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

WHERE
  c."useremail" = ${email}
  ${deletedCondition}

  ORDER BY c."id" DESC
  LIMIT 20
`);

    // ==================================================
    // ✅ RESPONSE
    // ==================================================

    return NextResponse.json({
      success: true,
      courses: data.rows || [],
    });

  } catch (error) {
    console.error("Error fetching courses:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}