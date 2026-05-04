import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Not logged in" });
  }

  // NEW WAY (IMPORTANT)
  const client = await clerkClient();

  await client.users.updateUser(userId, {
    publicMetadata: {
      role: "admin",
    },
  });

  return NextResponse.json({ message: "You are now admin" });
}