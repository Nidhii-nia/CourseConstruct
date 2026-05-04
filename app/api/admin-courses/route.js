import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { ilike, and, eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const q = searchParams.get("q") || "";
  const level = searchParams.get("level");
  const status = searchParams.get("status");
  const showDeleted = searchParams.get("showDeleted") === "true";

  try {
    const conditions = [];

    // ✅ Always push conditions cleanly
    if (showDeleted) {
      conditions.push(eq(coursesTable.isDeleted, true)); // ✅ FIX
    } else {
      conditions.push(eq(coursesTable.isDeleted, false));
    }

    if (q) {
      conditions.push(ilike(coursesTable.name, `%${q}%`));
    }

    if (level && level !== "All") {
      conditions.push(eq(coursesTable.level, level));
    }

    if (status === "published") {
      conditions.push(eq(coursesTable.isPublished, true));
    } else if (status === "draft") {
      conditions.push(eq(coursesTable.isPublished, false));
    }

    // ✅ Avoid unnecessary and() if empty
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // ✅ Select only required fields (MAJOR PERFORMANCE BOOST)
    const courses = await db
      .select({
        cid: coursesTable.cid,
        name: coursesTable.name,
        level: coursesTable.level,
        category: coursesTable.category,
        isPublished: coursesTable.isPublished,
        isDeleted: coursesTable.isDeleted,
        createdAt: coursesTable.createdAt,
      })
      .from(coursesTable)
      .where(whereClause)
      .orderBy(desc(coursesTable.createdAt));

    return NextResponse.json(
      { courses },
      {
        headers: {
          "Cache-Control": "no-store", // prevent stale data
        },
      },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  const body = await req.json();

  try {
    const newCourse = await db
      .insert(coursesTable)
      .values({
        cid: crypto.randomUUID(),
        name: body.name,
        level: body.level,
        category: body.category,
        noOfChapters: body.noOfChapters || 0,
        useremail: body.useremail,
      })
      .returning();

    return NextResponse.json(newCourse[0]);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 },
    );
  }
}
