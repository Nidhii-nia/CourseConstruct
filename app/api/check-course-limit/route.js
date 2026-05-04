import { db } from "@/config/db";
import { coursesTable } from "@/config/schema";
import { currentUser, auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";

export async function GET() {
  try {
    const user = await currentUser();
    const { has } = await auth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hasPremiumAccess = has({ plan: "premium" });

    if (hasPremiumAccess) {
      return NextResponse.json({ allowed: true });
    }

    const courses = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(
            coursesTable.useremail,
            user?.primaryEmailAddress?.emailAddress
          ),
          eq(coursesTable.isDeleted, false)
        )
      );

    if (courses.length >= 1) {
      return NextResponse.json({
        allowed: false,
        reason: "LIMIT_EXCEEDED",
      });
    }

    return NextResponse.json({ allowed: true });

  } catch (err) {
    return NextResponse.json(
      { error: "Failed to check limit" },
      { status: 500 }
    );
  }
}