import { db } from "@/config/db";
import {
  usersTable,
  coursesTable,
  enrollCourseTable,
} from "@/config/schema";
import { eq, count, desc, gt } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 📅 7 DAYS AGO
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // 📊 TOTAL USERS
    const totalUsers = await db
      .select({ count: count() })
      .from(usersTable)
      .then((res) => res[0]?.count || 0);

    // 🆕 USERS THIS WEEK
    const usersThisWeek = await db
      .select({ count: count() })
      .from(usersTable)
      .where(gt(usersTable.createdAt, lastWeek))
      .then((res) => res[0]?.count || 0);

    // 📉 USERS BEFORE THIS WEEK
    const usersBefore = totalUsers - usersThisWeek;

    // 📈 TREND %
    const usersTrend =
      usersBefore > 0
        ? Math.round((usersThisWeek / usersBefore) * 100)
        : usersThisWeek > 0
        ? 100
        : 0;

    // 📊 TOTAL COURSES
    const totalCourses = await db
      .select({ count: count() })
      .from(coursesTable)
      .where(eq(coursesTable.isDeleted, false))
      .then((res) => res[0]?.count || 0);

    // 📊 PUBLISHED COURSES
    const publishedCourses = await db
      .select({ count: count() })
      .from(coursesTable)
      .where(eq(coursesTable.isPublished, true))
      .then((res) => res[0]?.count || 0);

    // 📊 DRAFT COURSES
    const draftCourses = await db
      .select({ count: count() })
      .from(coursesTable)
      .where(eq(coursesTable.isPublished, false))
      .then((res) => res[0]?.count || 0);

    // 📊 TOTAL ENROLLMENTS
    const totalEnrollments = await db
      .select({ count: count() })
      .from(enrollCourseTable)
      .then((res) => res[0]?.count || 0);

    // 🔥 TOP COURSES
    const topCourses = await db
      .select({
        cid: coursesTable.cid,
        name: coursesTable.name,
        enrollments: count(enrollCourseTable.id),
      })
      .from(coursesTable)
      .leftJoin(
        enrollCourseTable,
        eq(coursesTable.cid, enrollCourseTable.cid)
      )
      .where(eq(coursesTable.isDeleted, false))
      .groupBy(coursesTable.cid)
      .orderBy(desc(count(enrollCourseTable.id)))
      .limit(5);

    // 🆕 RECENT USERS
    const recentUsers = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
        createdAt: usersTable.createdAt,
      })
      .from(usersTable)
      .orderBy(desc(usersTable.createdAt))
      .limit(5);

    return NextResponse.json({
      totalUsers,
      usersTrend, // ✅ REAL TREND ADDED
      totalCourses,
      publishedCourses,
      draftCourses,
      totalEnrollments,
      topCourses,
      recentUsers: recentUsers || [],
    });
  } catch (err) {
    console.error("Analytics Error:", err);

    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}