import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function PUT(req) {
  try {
    console.log("🔵 Updating course...");

    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;

    const body = await req.json();
    const { 
      cid, 
      action, 
      chapterIndex, 
      newChapterName, 
      topicIndex, 
      newTopicName 
    } = body;

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

    if (!courses.length) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const course = courses[0];

    if (course.useremail !== userEmail) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // ✅ Bulk update support (after authorization)
    if (body.updatedCourseJson) {
      await db.update(coursesTable)
        .set({ courseJson: body.updatedCourseJson })
        .where(
          and(
            eq(coursesTable.cid, cid),
            eq(coursesTable.isDeleted, false)
          )
        );

      return NextResponse.json({ success: true });
    }

    if (!action) {
      return NextResponse.json(
        { error:"Action required" },
        { status: 400 }
      );
    }

    // 🧠 Deep clone
    let updatedCourseJson = JSON.parse(JSON.stringify(course.courseJson));

    const chapters = updatedCourseJson.course.chapters;

    // Validate course structure first
    if (!Array.isArray(chapters)) {
      return NextResponse.json(
        { error: "Invalid course structure" },
        { status: 400 }
      );
    }

    // ============================
    // 📘 CHAPTER ACTIONS
    // ============================

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

      if (!newChapterName?.trim()) {
        return NextResponse.json(
          { error: "Chapter name required" },
          { status: 400 }
        );
      }

      chapters[chapterIndex].chapterName = newChapterName.trim();

      console.log("✏️ Chapter updated:", chapterIndex);
    }

    else if (action === "add-chapter") {
      if (!newChapterName?.trim()) {
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

    // ============================
    // 📚 TOPIC ACTIONS
    // ============================

    else {
      // Validate chapter index first
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
          { error: `Chapter not found at index ${chapterIndex}` },
          { status: 400 }
        );
      }

      const topics = chapter.topics || [];

      // Validate topics array
      if (!Array.isArray(topics)) {
        return NextResponse.json(
          { error: "Invalid topics array" },
          { status: 400 }
        );
      }

      if (action === "update") {
        // Validate topicIndex and newTopicName for update
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

        if (!newTopicName || typeof newTopicName !== "string" || !newTopicName.trim()) {
          return NextResponse.json(
            { error: "Topic name required" },
            { status: 400 }
          );
        }

        topics[topicIndex] = newTopicName.trim();
      }

      else if (action === "add") {
        // Validate newTopicName for add
        if (!newTopicName || typeof newTopicName !== "string" || !newTopicName.trim()) {
          return NextResponse.json(
            { error: "Topic name required" },
            { status: 400 }
          );
        }

        topics.push(newTopicName.trim());
      }

      else if (action === "delete") {
        // Validate topicIndex for delete
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
      }

      else {
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
      }
    }

    // ============================
    // 💾 SAVE
    // ============================

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