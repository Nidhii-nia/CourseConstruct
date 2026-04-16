
import { db } from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { currentUser, auth } from "@clerk/nextjs/server";
import { and, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    // AUTH CHECK AT THE VERY TOP - before parsing request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await req.json();
    const user = await currentUser();

    if (!courseId || !user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json(
        { error: "Missing courseId or user" },
        { status: 400 },
      );
    }

    // Check if already enrolled
    const enrolled = await db
      .select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(
            enrollCourseTable.useremail,
            user?.primaryEmailAddress?.emailAddress,
          ),
          eq(enrollCourseTable.cid, courseId),
        ),
      );

    if (enrolled.length > 0) {
      return NextResponse.json(
        { response: "Already Enrolled to the course" },
        { status: 409 },
      );
    }

    // Create enrollment with empty completedChapters array
    const result = await db
      .insert(enrollCourseTable)
      .values({
        cid: courseId,
        useremail: user?.primaryEmailAddress?.emailAddress,
        completedChapters: [], // Initialize as empty array
      })
      .returning();

    return NextResponse.json(result[0], { status: 201 });
  } catch (err) {
    console.error("❌ Enroll POST error:", err);
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    const email = user?.primaryEmailAddress?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // -----------------------------
    // CASE 1: Single course check
    // -----------------------------
    if (courseId) {
      const enrolled = await db
        .select()
        .from(enrollCourseTable)
        .where(
          and(
            eq(enrollCourseTable.useremail, email),
            eq(enrollCourseTable.cid, courseId),
          ),
        );

      if (!enrolled[0]) {
        return NextResponse.json(
          { error: "Course not enrolled" },
          { status: 404 },
        );
      }

      const course = await db
        .select()
        .from(coursesTable)
        .where(eq(coursesTable.cid, courseId));

      return NextResponse.json({
        ...course[0],
        enrollment: enrolled[0],
      });
    }

    // -----------------------------
    // CASE 2: All enrolled courses
    // -----------------------------
    const enrollments = await db
      .select()
      .from(enrollCourseTable)
      .where(eq(enrollCourseTable.useremail, email))
      .orderBy(desc(enrollCourseTable.id))
      .limit(50); // 🔥 IMPORTANT

    if (!enrollments.length) {
      return NextResponse.json([]);
    }

    const courseIds = enrollments.map((e) => e.cid);

    const filteredCourses = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          inArray(coursesTable.cid, courseIds),
          eq(coursesTable.isDeleted, false)
        )
      );

    const result = enrollments
      .map((enroll) => {
        const course = filteredCourses.find(
          (c) => c.cid === enroll.cid,
        );

        // Only include enrollments with a matching course
        if (!course) {
          return null;
        }

        return {
          ...course,
          enrollment: enroll,
        };
      })
      .filter((item) => item !== null);

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Enroll GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

export async function PUT(req) {
  try {
    // AUTH CHECK AT THE VERY TOP - before parsing request
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { completedChapters, courseId } = await req.json();
    const user = await currentUser();

    if (!courseId || !Array.isArray(completedChapters)) {
      return NextResponse.json(
        { error: "Invalid courseId or completedChapters" },
        { status: 400 },
      );
    }

    const userEmail = user?.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 },
      );
    }

    const result = await db
      .update(enrollCourseTable)
      .set({
        completedChapters,
      })
      .where(
        and(
          eq(enrollCourseTable.cid, courseId),
          eq(enrollCourseTable.useremail, userEmail),
        ),
      )
      .returning(enrollCourseTable);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Enroll PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update completion" },
      { status: 500 },
    );
  }
}

export async function DELETE(req) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const cid = searchParams.get("cid");

    if (!cid) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // 🔥 Delete enrollment and capture result
    const result = await db
      .delete(enrollCourseTable)
      .where(
        and(
          eq(enrollCourseTable.cid, cid),
          eq(enrollCourseTable.useremail, userEmail)
        )
      );

    // Check if any rows were actually deleted
    if (!result) {
      return NextResponse.json(
        { error: "Enrollment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Unenrolled successfully",
    });
  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to unenroll" },
      { status: 500 }
    );
  }
}
