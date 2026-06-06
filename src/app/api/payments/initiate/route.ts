import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    const txRef = `gradpath-${uuidv4()}`;
    await prisma.payment.create({ data: { userId: user.id, amount: 5000, currency: "NGN", status: "PENDING", transactionReference: txRef } });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://grad-path-jmem.vercel.app";
    const paymentLink = `https://checkout.flutterwave.com/v3/hosted/pay?public_key=${process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY}&tx_ref=${txRef}&amount=5000&currency=NGN&customer[email]=${encodeURIComponent(user.email)}&customer[name]=${encodeURIComponent(user.name || "")}&redirect_url=${encodeURIComponent(baseUrl + "/settings?tab=billing")}&customizations[title]=GradPath%20Pro`;
    return NextResponse.json({ paymentLink, txRef });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
