import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TasksClient from "./TasksClient";

export default async function TasksPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      applications: {
        include: {
          tasks: { orderBy: { createdAt: "asc" } },
          documents: { select: { id: true, type: true } },
        },
        orderBy: { deadline: "asc" },
      },
    },
  });
  if (!user) redirect("/sign-in");

  return <TasksClient applications={user.applications} />;
}
