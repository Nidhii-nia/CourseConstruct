import { db } from "@/config/db";

import {
  auth,
  currentUser,
} from "@clerk/nextjs/server";

import {
  coursesTable,
  enrollCourseTable,
} from "@/config/schema";

import {
  and,
  desc,
  eq,
  inArray,
  sql,
} from "drizzle-orm";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

// ======================================================
// 🔐 COMMON AUTH HELPER
// ======================================================

async function getAuthenticatedUser() {

  const { userId } = await auth();

  if (!userId) {
    return {
      error: NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      ),
    };
  }

const user = await currentUser();

const email =
  user?.primaryEmailAddress
    ?.emailAddress;

  if (!email) {
    return {
      error: NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      ),
    };
  }

  return {
    email,
  };
}

// ======================================================
// 🚀 POST - ENROLL COURSE
// ======================================================

export async function POST(req) {

  try {

    const authResult =
      await getAuthenticatedUser();

    if (authResult.error) {
      return authResult.error;
    }

    const { email } = authResult;

    const body = await req.json();

    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json(
        { error: "Missing courseId" },
        { status: 400 }
      );
    }

    // ==================================================
    // 🔍 CHECK EXISTING ENROLLMENT
    // ==================================================

    const enrolled = await db
      .select({
        id: enrollCourseTable.id,
      })
      .from(enrollCourseTable)
      .where(
        and(
          eq(
            enrollCourseTable.useremail,
            email
          ),

          eq(
            enrollCourseTable.cid,
            courseId
          )
        )
      )
      .limit(1);

    if (enrolled.length > 0) {
      return NextResponse.json(
        {
          response:
            "Already Enrolled to the course",
        },
        { status: 409 }
      );
    }

    // ==================================================
    // ✅ INSERT
    // ==================================================

    const result = await db
      .insert(enrollCourseTable)
      .values({
        cid: courseId,
        useremail: email,
        completedChapters: [],
      })

      .returning({
        cid:
          enrollCourseTable.cid,

        useremail:
          enrollCourseTable.useremail,
      });

    return NextResponse.json(
      result[0],
      { status: 201 }
    );

  } catch (err) {

    console.error(
      "❌ Enroll POST error:",
      err
    );

    return NextResponse.json(
      { error: "Failed to enroll" },
      { status: 500 }
    );
  }
}

// ======================================================
// 📚 GET
// ======================================================

export async function GET(req) {

  try {

    const authResult =
      await getAuthenticatedUser();

    if (authResult.error) {
      return authResult.error;
    }

    const { email } = authResult;

    const { searchParams } =
      new URL(req.url);

    const courseId =
      searchParams.get("courseId");

    // ==================================================
    // 🔹 CASE 1: SINGLE COURSE
    // ==================================================

    if (courseId) {

      const enrolled = await db
        .select({
          cid:
            enrollCourseTable.cid,

          completedChapters:
            enrollCourseTable.completedChapters,
        })

        .from(enrollCourseTable)

        .where(
          and(

            eq(
              enrollCourseTable.useremail,
              email
            ),

            eq(
              enrollCourseTable.cid,
              courseId
            )
          )
        )

        .limit(1);

      if (!enrolled[0]) {

        return NextResponse.json(
          {
            error:
              "Course not enrolled",
          },
          { status: 404 }
        );
      }

      // ==================================================
      // ⚡ FULL COURSE DATA ONLY HERE
      // ==================================================

      const course = await db
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

  courses: [
    {
      ...course[0],
      enrollment: enrolled[0],
    },
  ],
});
    }

    // ==================================================
    // 🔹 CASE 2: ALL ENROLLED COURSES
    // ==================================================

    const enrollments = await db
      .select({
        cid:
          enrollCourseTable.cid,

        completedChapters:
          enrollCourseTable.completedChapters,
      })

      .from(enrollCourseTable)

      .where(
        eq(
          enrollCourseTable.useremail,
          email
        )
      )

      .orderBy(
        desc(
          enrollCourseTable.id
        )
      )

      .limit(50);

    if (!enrollments.length) {

      return NextResponse.json({
        success: true,
        courses: [],
      });
    }

    const courseIds =
      enrollments.map(
        (e) => e.cid
      );

    // ==================================================
    // 🚀 LIGHTWEIGHT COURSE QUERY
    // ==================================================

    const filteredCourses = await db
      .select({

        cid:
          coursesTable.cid,

        name:
          coursesTable.name,

        bannerImgUrl:
          coursesTable.bannerImgUrl,

        noOfChapters:
          coursesTable.noOfChapters,

        hasContent:
          coursesTable.hasContent,

        isPublished:
          coursesTable.isPublished,

        description: sql`
          ${coursesTable.courseJson}
          -> 'course'
          ->> 'description'
        `.as("description"),
      })

      .from(coursesTable)

      .where(
        and(

          inArray(
            coursesTable.cid,
            courseIds
          ),

          eq(
            coursesTable.isDeleted,
            false
          )
        )
      );

    // ==================================================
    // ⚡ FAST LOOKUP MAP
    // ==================================================

    const courseMap =
      new Map(

        filteredCourses.map(
          (course) => [
            course.cid,
            course,
          ]
        )
      );

    const result =
      enrollments

        .map((enroll) => {

          const course =
            courseMap.get(
              enroll.cid
            );

          if (!course) {
            return null;
          }

          return {
            ...course,
            enrollment: enroll,
          };
        })

        .filter(Boolean);

    return NextResponse.json({
      success: true,
      courses: result,
    });

  } catch (err) {

    console.error(
      "❌ Enroll GET error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// ✏️ PUT - UPDATE COMPLETION
// ======================================================

export async function PUT(req) {

  try {

    const authResult =
      await getAuthenticatedUser();

    if (authResult.error) {
      return authResult.error;
    }

    const { email } =
      authResult;

    const body =
      await req.json();

    const {
      completedChapters,
      courseId,
    } = body;

    if (
      !courseId ||
      !Array.isArray(
        completedChapters
      )
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid courseId or completedChapters",
        },
        { status: 400 }
      );
    }

    const result = await db
      .update(
        enrollCourseTable
      )

      .set({
        completedChapters,
      })

      .where(
        and(

          eq(
            enrollCourseTable.cid,
            courseId
          ),

          eq(
            enrollCourseTable.useremail,
            email
          )
        )
      )

      .returning({
        cid:
          enrollCourseTable.cid,

        completedChapters:
          enrollCourseTable.completedChapters,
      });

    if (!result.length) {

      return NextResponse.json(
        {
          error:
            "Enrollment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      result[0]
    );

  } catch (err) {

    console.error(
      "❌ Enroll PUT error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Failed to update completion",
      },
      { status: 500 }
    );
  }
}

// ======================================================
// ❌ DELETE - UNENROLL
// ======================================================

export async function DELETE(req) {

  try {

    const authResult =
      await getAuthenticatedUser();

    if (authResult.error) {
      return authResult.error;
    }

    const { email } =
      authResult;

    const { searchParams } =
      new URL(req.url);

    const cid =
      searchParams.get("cid");

    if (!cid) {

      return NextResponse.json(
        {
          error:
            "Course ID is required",
        },
        { status: 400 }
      );
    }

    const result = await db

      .delete(
        enrollCourseTable
      )

      .where(
        and(

          eq(
            enrollCourseTable.cid,
            cid
          ),

          eq(
            enrollCourseTable.useremail,
            email
          )
        )
      )

      .returning({
        cid:
          enrollCourseTable.cid,
      });

    if (!result.length) {

      return NextResponse.json(
        {
          error:
            "Enrollment not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,

      message:
        "Unenrolled successfully",

      cid:
        result[0].cid,
    });

  } catch (error) {

    console.error(
      "DELETE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to unenroll",
      },
      { status: 500 }
    );
  }
}