import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    await captureServerEvent({
      distinctId: user.clerkId,
      event: "account_deleted",
      properties: {
        plan: user.plan,
      },
    });

    // Delete DB rows first (cascades to applications, tasks, documents, reviews, payments, notifications)
    await prisma.user.deleteMany({ where: { clerkId: userId } });

    // Then delete the Clerk user
    try {
      const client = await clerkClient();
      await client.users.deleteUser(userId);
    } catch {
      // If Clerk deletion fails, the DB row is already gone; surface a soft error
      return NextResponse.json({ success: true, clerkDeleted: false });
    }

    return NextResponse.json({ success: true, clerkDeleted: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
