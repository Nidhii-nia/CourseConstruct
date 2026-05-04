import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(_, { params }) {
  const { cid } = params;

  try {
    const course = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.cid, cid),
          eq(coursesTable.isDeleted, false) // filter
        )
      )
      .then((res) => res[0]);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch {
    return NextResponse.json(
      { error: "Fetch failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(req, { params }) {
  const { cid } = params;
  const body = await req.json();

  try {
    const course = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.cid, cid))
      .then((res) => res[0]);

    // 🚫 BLOCK publish if no content
    if (body.isPublished && !course.hasContent) {
      return NextResponse.json(
        { error: "Cannot publish course without content" },
        { status: 400 }
      );
    }

    await db
      .update(coursesTable)
      .set({
        isPublished: body.isPublished,
      })
      .where(eq(coursesTable.cid, cid));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_, { params }) {
  const { cid } = params;

  try {
    await db
      .update(coursesTable)
      .set({ isDeleted: true })
      .where(eq(coursesTable.cid, cid));

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}