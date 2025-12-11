// import { db } from "@/config/db";
// import { coursesTable, enrollCourseTable } from "@/config/schema";
// import { currentUser } from "@clerk/nextjs/server";
// import { and, desc, eq } from "drizzle-orm";
// import { NextResponse } from "next/server";

// export async function POST(req) {
//   try {
//     const { courseId } = await req.json();
//     const user = await currentUser();

//     if (!courseId || !user?.primaryEmailAddress?.emailAddress) {
//       return NextResponse.json({ error: "Missing courseId or user" }, { status: 400 });
//     }

//     // Check if already enrolled
//     const enrolled = await db.select()
//       .from(enrollCourseTable)
//       .where(
//         and(
//           eq(enrollCourseTable.useremail, user.primaryEmailAddress.emailAddress),
//           eq(enrollCourseTable.cid, courseId)
//         )
//       );

//     if (enrolled.length > 0) {
//       return NextResponse.json({ response: 'Already Enrolled to the course' }, { status: 409 });
//     }

//     // Create enrollment with empty completedChapters array
//     const result = await db.insert(enrollCourseTable)
//       .values({
//         cid: courseId,
//         useremail: user.primaryEmailAddress.emailAddress,
//         completedChapters: [] // Initialize as empty array
//       })
//       .returning();

//     return NextResponse.json(result[0], { status: 201 });
//   } catch (err) {
//     console.error("❌ Enroll POST error:", err);
//     return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
//   }
// }

// export async function GET(req) {
//   try {
//     const user = await currentUser();
//     const { searchParams } = new URL(req.url);
//     const courseId = searchParams.get("courseId");

//     if (!user?.primaryEmailAddress?.emailAddress) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     if (courseId) {
//       const result = await db.select()
//         .from(coursesTable)
//         .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
//         .where(
//           and(
//             eq(enrollCourseTable.useremail, user.primaryEmailAddress.emailAddress),
//             eq(enrollCourseTable.cid, courseId)
//           )
//         );

//       if (!result[0]) {
//         return NextResponse.json({ error: "Course not enrolled" }, { status: 404 });
//       }

//       return NextResponse.json(result[0]);
//     } else {
//       const result = await db.select()
//         .from(coursesTable)
//         .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
//         .where(eq(enrollCourseTable.useremail, user.primaryEmailAddress.emailAddress))
//         .orderBy(desc(enrollCourseTable.id));

//       return NextResponse.json(result);
//     }
//   } catch (err) {
//     console.error("❌ Enroll GET error:", err);
//     return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
//   }
// }

// export async function PUT(req) {
//   try {
//     const { completedChapters, courseId } = await req.json(); // ✅ Accept plural
//     const user = await currentUser();

//     if (!courseId || !Array.isArray(completedChapters)) {
//       return NextResponse.json({ error: "Invalid courseId or completedChapters" }, { status: 400 });
//     }

//     const result = await db.update(enrollCourseTable)
//       .set({
//         completedChapters
//       })
//       .where(
//         and(
//           eq(enrollCourseTable.cid, courseId),
//           eq(enrollCourseTable.useremail, user?.primaryEmailAddress?.emailAddress)
//         )
//       )
//       .returning(enrollCourseTable);

//     if (result.length === 0) {
//       return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
//     }

//     return NextResponse.json(result);
//   } catch (err) {
//     console.error("❌ Enroll PUT error:", err);
//     return NextResponse.json({ error: "Failed to update completion" }, { status: 500 });
//   }
// } 

import { db } from "@/config/db";
import { coursesTable, enrollCourseTable } from "@/config/schema";
import { currentUser, auth } from "@clerk/nextjs/server";
import { and, desc, eq } from "drizzle-orm";
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
      return NextResponse.json({ error: "Missing courseId or user" }, { status: 400 });
    }

    // Check if already enrolled
    const enrolled = await db.select()
      .from(enrollCourseTable)
      .where(
        and(
          eq(enrollCourseTable.useremail, user.primaryEmailAddress.emailAddress),
          eq(enrollCourseTable.cid, courseId)
        )
      );

    if (enrolled.length > 0) {
      return NextResponse.json({ response: 'Already Enrolled to the course' }, { status: 409 });
    }

    // Create enrollment with empty completedChapters array
    const result = await db.insert(enrollCourseTable)
      .values({
        cid: courseId,
        useremail: user.primaryEmailAddress.emailAddress,
        completedChapters: [] // Initialize as empty array
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
    // AUTH CHECK AT THE VERY TOP
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!user?.primaryEmailAddress?.emailAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (courseId) {
      const result = await db.select()
        .from(coursesTable)
        .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
        .where(
          and(
            eq(enrollCourseTable.useremail, user.primaryEmailAddress.emailAddress),
            eq(enrollCourseTable.cid, courseId)
          )
        );

      if (!result[0]) {
        return NextResponse.json({ error: "Course not enrolled" }, { status: 404 });
      }

      return NextResponse.json(result[0]);
    } else {
      const result = await db.select()
        .from(coursesTable)
        .innerJoin(enrollCourseTable, eq(coursesTable.cid, enrollCourseTable.cid))
        .where(eq(enrollCourseTable.useremail, user.primaryEmailAddress.emailAddress))
        .orderBy(desc(enrollCourseTable.id));

      return NextResponse.json(result);
    }
  } catch (err) {
    console.error("❌ Enroll GET error:", err);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
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
      return NextResponse.json({ error: "Invalid courseId or completedChapters" }, { status: 400 });
    }

    const result = await db.update(enrollCourseTable)
      .set({
        completedChapters
      })
      .where(
        and(
          eq(enrollCourseTable.cid, courseId),
          eq(enrollCourseTable.useremail, user?.primaryEmailAddress?.emailAddress)
        )
      )
      .returning(enrollCourseTable);

    if (result.length === 0) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("❌ Enroll PUT error:", err);
    return NextResponse.json({ error: "Failed to update completion" }, { status: 500 });
  }
}