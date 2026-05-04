import { Webhook } from "svix";
import { headers } from "next/headers";
import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { eq } from "drizzle-orm";

export async function POST(req) {
  const payload = await req.text();
  const headerPayload = headers();

  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

  let evt;

  try {
    evt = wh.verify(payload, {
      "svix-id": headerPayload.get("svix-id"),
      "svix-timestamp": headerPayload.get("svix-timestamp"),
      "svix-signature": headerPayload.get("svix-signature"),
    });
  } catch (err) {
    return new Response("Invalid webhook", { status: 400 });
  }

  const eventType = evt.type;
  const data = evt.data;

  // SUBSCRIPTION CREATED / UPDATED
  if (
    eventType === "subscription.created" ||
    eventType === "subscription.updated"
  ) {
    const email = data.customer?.email_addresses?.[0]?.email_address;
    const subscriptionId = data.id;

    if (email) {
      await db
        .update(usersTable)
        .set({
          subscriptionId: subscriptionId,
        })
        .where(eq(usersTable.email, email));
    }
  }

  // ❌ SUBSCRIPTION CANCELLED
  if (eventType === "subscription.deleted") {
    const email = data.customer?.email_addresses?.[0]?.email_address;

    if (email) {
      await db
        .update(usersTable)
        .set({
          subscriptionId: null,
        })
        .where(eq(usersTable.email, email));
    }
  }

  return new Response("OK", { status: 200 });
}