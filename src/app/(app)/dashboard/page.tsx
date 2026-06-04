import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const [applications, notifications] = await Promise.all([
    prisma.application.findMany({
      where: { userId: user.id },
      include: { tasks: true },
      orderBy: { deadline: "asc" },
    }),
    prisma.notification.findMany({
      where: { userId: user.id, read: false },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return <DashboardClient user={user} applications={applications} notifications={notifications} />;
}
