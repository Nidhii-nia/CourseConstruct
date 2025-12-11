import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function PUT(req) {
  try {
    console.log("🔵 Updating course topics...");
    
    // Authenticate user
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: "Unauthorized - Please log in" },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    // Parse request body
    const body = await req.json();
    const { cid, chapterIndex, topicIndex, newTopicName, action = 'update' } = body;

    console.log("📦 Update request:", { cid, chapterIndex, topicIndex, newTopicName, action });

    // Validate inputs
    if (!cid) {
      return NextResponse.json(
        { error: "Course ID (cid) is required" },
        { status: 400 }
      );
    }
    
    if (chapterIndex === undefined || chapterIndex === null) {
      return NextResponse.json(
        { error: "Chapter index is required" },
        { status: 400 }
      );
    }
    
    if (action === 'update' && (topicIndex === undefined || topicIndex === null)) {
      return NextResponse.json(
        { error: "Topic index is required" },
        { status: 400 }
      );
    }
    
    if (action === 'update' && (!newTopicName || typeof newTopicName !== 'string' || newTopicName.trim() === '')) {
      return NextResponse.json(
        { error: "Valid topic name is required" },
        { status: 400 }
      );
    }

    if (action === 'add' && (!newTopicName || typeof newTopicName !== 'string' || newTopicName.trim() === '')) {
      return NextResponse.json(
        { error: "Valid topic name is required" },
        { status: 400 }
      );
    }

    if (action === 'delete' && topicIndex === undefined) {
      return NextResponse.json(
        { error: "Topic index is required for deletion" },
        { status: 400 }
      );
    }

    // Get the course
    const courses = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, cid));

    if (courses.length === 0) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    const course = courses[0];
    
    // Check if user owns this course
    if (course.useremail !== userEmail) {
      return NextResponse.json(
        { error: "You can only edit your own courses" },
        { status: 403 }
      );
    }

    // Deep clone the courseJson
    let updatedCourseJson;
    try {
      updatedCourseJson = JSON.parse(JSON.stringify(course.courseJson));
    } catch (parseErr) {
      console.error("Error parsing course JSON:", parseErr);
      return NextResponse.json(
        { error: "Invalid course data format" },
        { status: 500 }
      );
    }

    // Validate and update the topic
    if (!updatedCourseJson || !updatedCourseJson.course) {
      return NextResponse.json(
        { error: "Invalid course structure" },
        { status: 400 }
      );
    }

    const chapters = updatedCourseJson.course.chapters;
    
    if (!Array.isArray(chapters) || chapterIndex >= chapters.length) {
      return NextResponse.json(
        { error: `Chapter ${chapterIndex} not found` },
        { status: 400 }
      );
    }

    const chapter = chapters[chapterIndex];
    const topics = chapter.topics;
    
    if (!Array.isArray(topics)) {
      return NextResponse.json(
        { error: `Invalid topics array in chapter ${chapterIndex}` },
        { status: 400 }
      );
    }

    if (action === 'update') {
      if (topicIndex >= topics.length) {
        return NextResponse.json(
          { error: `Topic ${topicIndex} not found in chapter ${chapterIndex}` },
          { status: 400 }
        );
      }

      // Update the topic
      const oldTopic = topics[topicIndex];
      topics[topicIndex] = newTopicName.trim();
      
      console.log("✅ Updating topic:", {
        chapterIndex,
        topicIndex,
        oldTopic,
        newTopic: newTopicName.trim()
      });

    } else if (action === 'add') {
      // Add new topic
      topics.push(newTopicName.trim());
      
      console.log("➕ Adding new topic:", {
        chapterIndex,
        newTopic: newTopicName.trim(),
        totalTopics: topics.length
      });

    } else if (action === 'delete') {
      if (topicIndex >= topics.length) {
        return NextResponse.json(
          { error: `Topic ${topicIndex} not found in chapter ${chapterIndex}` },
          { status: 400 }
        );
      }

      // Delete the topic
      const deletedTopic = topics[topicIndex];
      topics.splice(topicIndex, 1);
      
      console.log("🗑️ Deleting topic:", {
        chapterIndex,
        topicIndex,
        deletedTopic,
        remainingTopics: topics.length
      });
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'update', 'add', or 'delete'" },
        { status: 400 }
      );
    }

    // Update in database
    await db
      .update(coursesTable)
      .set({ 
        courseJson: updatedCourseJson
      })
      .where(eq(coursesTable.cid, cid));

    return NextResponse.json({
      success: true,
      message: action === 'update' ? "Topic updated successfully" : 
               action === 'add' ? "Topic added successfully" : 
               "Topic deleted successfully",
      updatedCourse: updatedCourseJson,
      action: action,
      changes: {
        chapterIndex,
        topicIndex,
        ...(action === 'update' || action === 'add' ? { newTopic: newTopicName.trim() } : {}),
        ...(action === 'delete' ? { deletedTopic: topics[topicIndex] } : {})
      }
    });

  } catch (err) {
    console.error("❌ Error updating/deleting topic:", err);
    return NextResponse.json(
      { 
        error: "Internal server error", 
        details: err.message,
        hint: "Check server logs for more details"
      },
      { status: 500 }
    );
  }
}