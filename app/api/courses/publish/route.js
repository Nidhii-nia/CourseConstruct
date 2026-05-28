import { NextResponse } from "next/server";

import { db } from "@/config/db";

import {
  coursesTable,
} from "@/config/schema";

import {
  eq,
  and,
} from "drizzle-orm";

import {
  currentUser,
} from "@clerk/nextjs/server";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

export async function PATCH(req) {

  try {

    // ==================================================
    // 🔐 AUTH
    // ==================================================

    const user =
      await currentUser();

    if (!user) {

      return NextResponse.json(
        {
          error:
            "Unauthorized",
        },
        { status: 401 }
      );
    }

    const email =
      user?.primaryEmailAddress
        ?.emailAddress;

    if (!email) {

      return NextResponse.json(
        {
          error:
            "Email not found",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // 📦 BODY
    // ==================================================

    const body =
      await req.json();

    const {
      cid,
      publish,
    } = body;

    // ==================================================
    // ✅ VALIDATION
    // ==================================================

    if (!cid) {

      return NextResponse.json(
        {
          error:
            "Course ID required",
        },
        { status: 400 }
      );
    }

    if (
      typeof publish !==
      "boolean"
    ) {

      return NextResponse.json(
        {
          error:
            "Invalid publish value",
        },
        { status: 400 }
      );
    }

    // ==================================================
    // 🚀 UPDATE
    // ==================================================

    const result = await db

      .update(coursesTable)

      .set({
        isPublished:
          publish,
      })

      .where(
        and(

          eq(
            coursesTable.cid,
            cid
          ),

          eq(
            coursesTable.useremail,
            email
          )
        )
      )

      .returning({

        cid:
          coursesTable.cid,

        isPublished:
          coursesTable.isPublished,
      });

    // ==================================================
    // ❌ NOT FOUND
    // ==================================================

    if (!result.length) {

      return NextResponse.json(
        {
          error:
            "Course not found or unauthorized",
        },
        { status: 404 }
      );
    }

    // ==================================================
    // ✅ RESPONSE
    // ==================================================

    return NextResponse.json({

      success: true,

      data:
        result[0],
    });

  } catch (err) {

    console.error(
      "Publish API Error:",
      err
    );

    return NextResponse.json(
      {
        error:
          err?.message ||
          "Failed",
      },
      { status: 500 }
    );
  }
}