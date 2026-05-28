// app/api/test-db/route.js
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT NOW()`);
    return NextResponse.json({ 
      success: true, 
      time: result.rows[0].now,
      message: "Database connected successfully!" 
    });
  } catch (error) {
    console.error("DB Connection Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      cause: error.cause?.message 
    }, { status: 500 });
  }
}