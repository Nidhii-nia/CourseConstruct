import { NextResponse } from "next/server";
import { db } from "@/config/db"; // your db instance
import { usersTable, coursesTable } from "@/config/schema";
import { ilike, or } from "drizzle-orm";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  if (!q || q.length < 2) {
    return NextResponse.json({ users: [], courses: [] });
  }

  try {
    // 🔍 USERS SEARCH
    const users = await db
      .select({
        id: usersTable.id,
        name: usersTable.name,
        email: usersTable.email,
      })
      .from(usersTable)
      .where(ilike(usersTable.email, `%${q}%`))
      .limit(5);

    // 📚 COURSES SEARCH
    const courses = await db
      .select({
        id: coursesTable.cid,
        title: coursesTable.name,
        level: coursesTable.level,
        category: coursesTable.category,
        banner: coursesTable.bannerImgUrl,
        courseJson: coursesTable.courseJson,
      })
      .from(coursesTable)
      .where(
        or(
          ilike(coursesTable.name, `%${q}%`),
          ilike(coursesTable.cid, `%${q}%`),
          ilike(coursesTable.category, `%${q}%`)
        ),
      )
      .limit(5);

    const formattedCourses = courses.map((c) => ({
      id: c.id,
      title: c.title,
      level: c.level,
      category: c.category,
      banner: c.banner,
      description: c.courseJson?.course?.description || "No description",
    }));

    return NextResponse.json({
      users,
      courses: formattedCourses,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
