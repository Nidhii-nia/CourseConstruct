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

    if (courseId) {
      result = await db
        .select({
          cid: coursesTable.cid,
          name: coursesTable.name,
          bannerImgUrl: coursesTable.bannerImgUrl,
          noOfChapters: coursesTable.noOfChapters,
          hasContent: coursesTable.hasContent,
          courseJson: coursesTable.courseJson, // ✅ NEEDED for CourseInfo
        })
        .from(coursesTable)
        .where(eq(coursesTable.cid, courseId))
        .limit(1);
    } else {
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
          courseJson: coursesTable.courseJson, // ✅ NEEDED for CourseCard
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



// import { NextResponse } from "next/server";
// import { currentUser } from "@clerk/nextjs/server";
// import { db } from "@/config/db";
// import { coursesTable } from "@/config/schema";
// import { desc, eq } from "drizzle-orm";

// export async function GET(req) {
//   try {
//     const headers = new Headers();
//     headers.set("Cache-Control", "no-store, max-age=0");

//     const { searchParams } = new URL(req.url);
//     const courseId = searchParams?.get("courseId");
//     const user = await currentUser();

//     let result;

//     if (courseId) {
//       console.log("🔍 Fetching course with ID:", courseId);
//       result = await db
//         .select({
//           id: coursesTable.id,
//           cid: coursesTable.cid,
//           name: coursesTable.name,
//           description: coursesTable.description,
//           noOfChapters: coursesTable.noOfChapters,
//           courseJson: coursesTable.courseJson,
//           bannerImgUrl: coursesTable.bannerImgUrl,
//           useremail: coursesTable.useremail,
//           hasContent:coursesTable.hasContent,
//         })
//         .from(coursesTable)
//         .where(eq(coursesTable.cid, courseId))
//         .limit(1);
//     } else {
//       if (!user?.primaryEmailAddress?.emailAddress) {
//         return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
//       }

//       result = await db
//         .select({
//           id: coursesTable.id,
//           cid: coursesTable.cid,
//           name: coursesTable.name,
//           description: coursesTable.description,
//           noOfChapters: coursesTable.noOfChapters,
//           courseJson: coursesTable.courseJson,
//           bannerImgUrl: coursesTable.bannerImgUrl,
//           useremail: coursesTable.useremail,
//           hasContent: coursesTable.hasContent, 
//         })
//         .from(coursesTable)
//         .where(eq(coursesTable.useremail, user.primaryEmailAddress.emailAddress))
//         .orderBy(desc(coursesTable.id))
//         .limit(20);
//     }

//     return NextResponse.json({
//       success: true,
//       message: result.length === 0 ? "No courses found" : "Courses fetched successfully",
//       courses: result || [],
//     }, { headers });

//   } catch (error) {
//     console.error("❌ Error fetching courses:", error);
//     return NextResponse.json(
//       { success: false, error: error.message },
//       { status: 500 }
//     );
//   }
// }
