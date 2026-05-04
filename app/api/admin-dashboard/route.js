import { db } from "@/config/db";
import {
  usersTable,
  coursesTable,
  enrollCourseTable,
  quizAttemptTable,
  courseFeedbackTable,
} from "@/config/schema";
import { count, gte, desc } from "drizzle-orm";

export async function GET() {
  try {
    // ---- STATS ----
    const users = await db.select({ value: count() }).from(usersTable);
    const courses = await db.select({ value: count() }).from(coursesTable);

    const activeUsersData = await db
      .selectDistinct({ user: enrollCourseTable.useremail })
      .from(enrollCourseTable);

    const quizAttempts = await db
      .select({ value: count() })
      .from(quizAttemptTable);

    const feedbacks = await db
      .select({ value: count() })
      .from(courseFeedbackTable);

    const stats = [
      { title: "Total Users", value: users[0]?.value || 0 },
      { title: "Courses Generated", value: courses[0]?.value || 0 },
      { title: "Active Users", value: activeUsersData.length },
      { title: "Quiz Attempts", value: quizAttempts[0]?.value || 0 },
      { title: "Feedbacks", value: feedbacks[0]?.value || 0 },
    ];

    // ---- TODAY ----
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newUsers = await db
      .select({ value: count() })
      .from(usersTable)
      .where(gte(usersTable.createdAt, today));

    const newCourses = await db
      .select({ value: count() })
      .from(coursesTable)
      .where(gte(coursesTable.createdAt, today));

    const quizToday = await db
      .select({ value: count() })
      .from(quizAttemptTable)
      .where(gte(quizAttemptTable.createdAt, today));

    // ---- RECENT ----
    const recentCoursesRaw = await db
      .select({
        name: coursesTable.name,
        user: coursesTable.useremail,
        createdAt: coursesTable.createdAt,
      })
      .from(coursesTable)
      .orderBy(desc(coursesTable.createdAt)) // ✅ FIX
      .limit(5);

    const recentQuizRaw = await db
      .select({
        user: quizAttemptTable.useremail,
        createdAt: quizAttemptTable.createdAt,
      })
      .from(quizAttemptTable)
      .orderBy(desc(quizAttemptTable.createdAt)) // ✅ FIX
      .limit(5);

    const recentEnrollRaw = await db
      .select({
        user: enrollCourseTable.useremail,
        cid: enrollCourseTable.cid,
        createdAt: enrollCourseTable.createdAt,
      })
      .from(enrollCourseTable)
      .orderBy(desc(enrollCourseTable.createdAt)) // ✅ FIX
      .limit(5);

    const recentFeedbackRaw = await db
      .select({
        user: courseFeedbackTable.useremail,
        cid: courseFeedbackTable.cid,
        createdAt: courseFeedbackTable.createdAt,
      })
      .from(courseFeedbackTable)
      .orderBy(desc(courseFeedbackTable.createdAt)) // ✅ FIX
      .limit(5);

    // ---- ADD TYPE (NO SQL) ----
    const recentCourses = recentCoursesRaw.map((i) => ({
      ...i,
      type: "course",
    }));

    const recentQuizAttempts = recentQuizRaw.map((i) => ({
      ...i,
      type: "quiz",
    }));

    const recentEnrollments = recentEnrollRaw.map((i) => ({
      ...i,
      type: "enroll",
    }));

    const recentFeedback = recentFeedbackRaw.map((i) => ({
      ...i,
      type: "feedback",
    }));

    const activities = [
      ...recentCourses,
      ...recentQuizAttempts,
      ...recentEnrollments,
      ...recentFeedback,
    ];

    // ---- SAFE SORT ----
    activities.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    const recentActivities = activities.slice(0, 10);

    return Response.json({
      stats,
      today: {
        users: newUsers[0]?.value || 0,
        courses: newCourses[0]?.value || 0,
        quiz: quizToday[0]?.value || 0,
      },
      recentActivities,
    });
  } catch (err) {
    console.error("API ERROR:", err);
    return Response.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}