import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    create: { email: session.user.email },
    update: {},
  });
  await prisma.subscription.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "active" },
    update: { status: "active" },
  });
  return NextResponse.redirect(new URL("/dashboard", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
