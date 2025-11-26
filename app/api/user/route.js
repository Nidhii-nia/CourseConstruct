import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

// ✅ Handle POST (Create or Fetch User)
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Missing email or name" },
        { status: 400 }
      );
    }

    // 🔍 Check if user already exists
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email));

    if (users.length === 0) {
      // 🧩 Insert new user
      const [result] = await db.insert(usersTable).values({ name, email }).returning();
      console.log("✅ User inserted:", result);
      return NextResponse.json(result, { status: 200 });
    }

    // ✅ Return existing user if found
    return NextResponse.json(users[0], { status: 200 });

  } catch (error) {
    console.error("❌ Error in /api/user:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ✅ Optional: Handle unsupported methods gracefully
export function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
