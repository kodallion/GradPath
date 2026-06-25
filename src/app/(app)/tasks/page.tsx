import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      tasks: { orderBy: { createdAt: "asc" } },
      documents: { select: { id: true, type: true } },
    },
    orderBy: { deadline: "asc" },
  });

  return <TasksClient applications={applications} />;
}

