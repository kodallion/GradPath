import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/posthog-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: {
        applications: { include: { tasks: true, documents: true } },
        documentReviews: true,
        payments: true,
        notifications: true,
      },
    });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // strip internal ids that aren't useful to the user? Keep them; it's their data.
    const payload = {
      exportedAt: new Date().toISOString(),
      profile: {
        name: user.name,
        email: user.email,
        plan: user.plan,
        memberSince: user.createdAt,
        preferences: user.preferences,
      },
      applications: user.applications,
      documentReviews: user.documentReviews,
      payments: user.payments,
      notifications: user.notifications,
    };

    await captureServerEvent({
      distinctId: user.clerkId,
      event: "data_export_requested",
      properties: {
        application_count: user.applications.length,
        notification_count: user.notifications.length,
      },
    });

    const json = JSON.stringify(payload, null, 2);
    return new NextResponse(json, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="gradpath-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
