import { auth } from "@clerk/nextjs/server";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationDetailClient from "./ApplicationDetailClient";

export default async function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const application = await prisma.application.findFirst({
    where: { id, userId: user.id },
    include: { tasks: { orderBy: { createdAt: "asc" } }, documents: true },
  });

  if (!application) notFound();

  return <ApplicationDetailClient application={application} />;
}
