import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      applications: {
        include: {
          tasks: true,
          documents: { select: { type: true } },
        },
        orderBy: { deadline: "asc" },
      },
    },
  });
  if (!user) redirect("/sign-in");

  const { applications, ...userOnly } = user;
  return <DashboardClient user={userOnly} applications={applications} />;
}
