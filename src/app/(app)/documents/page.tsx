import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DocumentsClient from "./DocumentsClient";

export default async function DocumentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) redirect("/sign-in");

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    include: {
      documents: true,
    },
    orderBy: { deadline: "asc" },
  });

  return <DocumentsClient applications={applications} />;
}

