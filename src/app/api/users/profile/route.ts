import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureServerEvent, identifyServerUser } from "@/lib/posthog-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await req.json();
    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (name.trim().length > 80) {
      return NextResponse.json({ error: "Name is too long" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: { name: name.trim() },
      select: { id: true, name: true, email: true, clerkId: true },
    });
    await identifyServerUser({
      distinctId: user.clerkId,
      properties: {
        email: user.email,
        name: user.name,
      },
    });
    await captureServerEvent({
      distinctId: user.clerkId,
      event: "profile_updated",
      properties: {
        has_name: Boolean(user.name),
      },
    });
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
