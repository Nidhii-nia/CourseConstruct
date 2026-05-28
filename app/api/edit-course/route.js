import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function PUT(req) {
  try {
    console.log("🔵 Updating course...");

const user = await currentUser();

if (!user) {
  return NextResponse.json(
    { error: "Unauthorized - Please log in" },
    { status: 401 }
  );
}

const userEmail = user.emailAddresses[0]?.emailAddress;

    //  Validate email exists
    if (!userEmail) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    const body = await req.json();

    const {
      cid,
      action,
      chapterIndex,
      newChapterName,
      topicIndex,
      newTopicName,
    } = body;

    //  Validate course id
    if (!cid) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    // 🔍 Fetch course
    const courses = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.cid, cid),
          eq(coursesTable.isDeleted, false)
        )
      );

    //  Course existence check
    if (!courses.length) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const course = courses[0];

    //  Ownership validation
    if (course.useremail !== userEmail) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // ====================================================
    //  BULK UPDATE SUPPORT
    // ====================================================

    if (body.updatedCourseJson) {
      const courseData = body.updatedCourseJson;

      //  Validate structure
      if (
        !courseData?.course?.chapters ||
        !Array.isArray(courseData.course.chapters)
      ) {
        return NextResponse.json(
          { error: "Invalid course JSON structure" },
          { status: 400 }
        );
      }

      await db
        .update(coursesTable)
        .set({
          courseJson: courseData,
        })
        .where(
          and(
            eq(coursesTable.cid, cid),
            eq(coursesTable.isDeleted, false)
          )
        );

      return NextResponse.json({
        success: true,
      });
    }

    //  Action validation AFTER bulk update
    if (!action) {
      return NextResponse.json(
        { error: "Action required" },
        { status: 400 }
      );
    }

    // ====================================================
    // 🧠 DEEP CLONE
    // ====================================================

    let updatedCourseJson = JSON.parse(
      JSON.stringify(course.courseJson)
    );

    //  Validate root structure
    if (
      !updatedCourseJson?.course ||
      !Array.isArray(updatedCourseJson.course.chapters)
    ) {
      return NextResponse.json(
        { error: "Invalid course structure" },
        { status: 400 }
      );
    }

    const chapters = updatedCourseJson.course.chapters;

    // ====================================================
    // 📘 CHAPTER ACTIONS
    // ====================================================

    if (action === "update-chapter") {
      if (
        chapterIndex === undefined ||
        chapterIndex < 0 ||
        chapterIndex >= chapters.length
      ) {
        return NextResponse.json(
          { error: "Invalid chapter index" },
          { status: 400 }
        );
      }

      if (
        !newChapterName ||
        typeof newChapterName !== "string" ||
        !newChapterName.trim()
      ) {
        return NextResponse.json(
          { error: "Chapter name required" },
          { status: 400 }
        );
      }

      chapters[chapterIndex].chapterName =
        newChapterName.trim();

      console.log("✏️ Chapter updated:", chapterIndex);
    }

    else if (action === "add-chapter") {
      if (
        !newChapterName ||
        typeof newChapterName !== "string" ||
        !newChapterName.trim()
      ) {
        return NextResponse.json(
          { error: "Chapter name required" },
          { status: 400 }
        );
      }

      chapters.push({
        chapterName: newChapterName.trim(),
        duration: "0",
        topics: [],
      });

      console.log("➕ Chapter added");
    }

    else if (action === "delete-chapter") {
      if (
        chapterIndex === undefined ||
        chapterIndex < 0 ||
        chapterIndex >= chapters.length
      ) {
        return NextResponse.json(
          { error: "Invalid chapter index" },
          { status: 400 }
        );
      }

      chapters.splice(chapterIndex, 1);

      console.log("🗑️ Chapter deleted:", chapterIndex);
    }

    // ====================================================
    // 📚 TOPIC ACTIONS
    // ====================================================

    else {
      //  Validate chapter index
      if (
        chapterIndex === undefined ||
        chapterIndex < 0 ||
        chapterIndex >= chapters.length
      ) {
        return NextResponse.json(
          { error: "Invalid chapter index" },
          { status: 400 }
        );
      }

      const chapter = chapters[chapterIndex];

      if (!chapter) {
        return NextResponse.json(
          {
            error: `Chapter not found at index ${chapterIndex}`,
          },
          { status: 400 }
        );
      }

      //  FIX: Ensure topics persist
      if (!chapter.topics) {
        chapter.topics = [];
      }

      const topics = chapter.topics;

      //  Validate topics array
      if (!Array.isArray(topics)) {
        return NextResponse.json(
          { error: "Invalid topics array" },
          { status: 400 }
        );
      }

      // ====================================================
      // ✏️ UPDATE TOPIC
      // ====================================================

      if (action === "update") {
        if (
          topicIndex === undefined ||
          topicIndex < 0 ||
          topicIndex >= topics.length
        ) {
          return NextResponse.json(
            { error: "Invalid topic index" },
            { status: 400 }
          );
        }

        if (
          !newTopicName ||
          typeof newTopicName !== "string" ||
          !newTopicName.trim()
        ) {
          return NextResponse.json(
            { error: "Topic name required" },
            { status: 400 }
          );
        }

        topics[topicIndex] = newTopicName.trim();

        console.log("✏️ Topic updated");
      }

      // ====================================================
      // ➕ ADD TOPIC
      // ====================================================

      else if (action === "add") {
        if (
          !newTopicName ||
          typeof newTopicName !== "string" ||
          !newTopicName.trim()
        ) {
          return NextResponse.json(
            { error: "Topic name required" },
            { status: 400 }
          );
        }

        topics.push(newTopicName.trim());

        console.log("➕ Topic added");
      }

      // ====================================================
      // 🗑️ DELETE TOPIC
      // ====================================================

      else if (action === "delete") {
        if (
          topicIndex === undefined ||
          topicIndex < 0 ||
          topicIndex >= topics.length
        ) {
          return NextResponse.json(
            { error: "Invalid topic index" },
            { status: 400 }
          );
        }

        topics.splice(topicIndex, 1);

        console.log("🗑️ Topic deleted");
      }

      else {
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
      }
    }

    // ====================================================
    // 💾 SAVE UPDATED COURSE
    // ====================================================

    await db
      .update(coursesTable)
      .set({
        courseJson: updatedCourseJson,
      })
      .where(
        and(
          eq(coursesTable.cid, cid),
          eq(coursesTable.isDeleted, false)
        )
      );

    return NextResponse.json({
      success: true,
      updatedCourse: updatedCourseJson,
      action,
    });

  } catch (err) {
    console.error("❌ Error:", err);

    return NextResponse.json(
      {
        error: "Internal server error",
        details: err.message,
      },
      { status: 500 }
    );
  }
}