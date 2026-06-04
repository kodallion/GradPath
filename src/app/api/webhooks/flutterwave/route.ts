import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("verif-hash");
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH || "gradpath-webhook-hash";

    if (signature !== secretHash) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body);

    if (event.event === "charge.completed" && event.data.status === "successful") {
      const txRef = event.data.tx_ref;

      // Update payment record
      await prisma.payment.updateMany({
        where: { transactionReference: txRef },
        data: { status: "SUCCESS", flutterwaveTxRef: String(event.data.id) },
      });

      // Find payment and upgrade user
      const payment = await prisma.payment.findFirst({ where: { transactionReference: txRef } });
      if (payment) {
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 7);

        await prisma.user.update({
          where: { id: payment.userId },
          data: {
            plan: "PRO",
            subscriptionStatus: "active",
            trialEndsAt: trialEnd,
            planExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        });

        await prisma.notification.create({
          data: {
            userId: payment.userId,
            type: "SUBSCRIPTION_EVENT",
            title: "Welcome to GradPath Pro! 🎉",
            message: "Your Pro plan is now active. Enjoy unlimited applications and AI reviews.",
          },
        });
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
