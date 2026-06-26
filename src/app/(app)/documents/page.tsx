import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DocumentsClient from "./DocumentsClient";

export default async function DocumentsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: {
      applications: {
        include: { documents: true },
        orderBy: { deadline: "asc" },
      },
    },
  });
  if (!user) redirect("/sign-in");

  return <DocumentsClient applications={user.applications} />;
}
