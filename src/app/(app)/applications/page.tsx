import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ApplicationsClient from "./ApplicationsClient";

export default async function ApplicationsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: { tasks: true, documents: true },
    orderBy: { deadline: "asc" },
  });

  return <ApplicationsClient applications={applications} plan={user.plan} />;
}
