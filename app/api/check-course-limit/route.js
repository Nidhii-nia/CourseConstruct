import { db } from "@/config/db";

import {
  coursesTable,
} from "@/config/schema";

import {
  currentUser,
  auth,
} from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

import {
  eq,
  and,
  count,
} from "drizzle-orm";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export async function GET() {

  try {

    // ==========================================
    // 🔐 AUTH
    // ==========================================

    const user =
      await currentUser();

    if (!user) {

      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const {
      has,
    } = await auth();

    // ==========================================
    // 💎 PREMIUM CHECK
    // ==========================================

    const hasPremiumAccess =
      has({
        plan: "premium",
      });

    if (hasPremiumAccess) {

      return NextResponse.json({
        allowed: true,
      });
    }

    // ==========================================
    // 📧 EMAIL
    // ==========================================

    const email =
      user?.primaryEmailAddress
        ?.emailAddress;

    if (!email) {

      return NextResponse.json(
        {
          error:
            "User email not found",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // 📚 COUNT COURSES
    // ==========================================

    const result = await db

      .select({
        total:
          count(),
      })

      .from(coursesTable)

      .where(
        and(

          eq(
            coursesTable.useremail,
            email
          ),

          eq(
            coursesTable.isDeleted,
            false
          )
        )
      );

    const totalCourses =
      Number(
        result?.[0]?.total || 0
      );

    // ==========================================
    // 🚫 FREE LIMIT
    // ==========================================

    if (totalCourses >= 1) {

      return NextResponse.json({

        allowed: false,

        reason:
          "LIMIT_EXCEEDED",
      });
    }

    // ==========================================
    // ✅ ALLOWED
    // ==========================================

    return NextResponse.json({
      allowed: true,
    });

  } catch (err) {

    console.error(
      "Check Limit Error:",
      err
    );

    return NextResponse.json(
      {
        error:
          "Failed to check limit",
      },
      { status: 500 }
    );
  }
}