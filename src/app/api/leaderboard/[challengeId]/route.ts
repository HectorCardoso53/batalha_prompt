import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ challengeId: string }> }) {
  const { challengeId } = await params;

  const submissions = await prisma.submission.findMany({
    where: { challengeId },
    include: { user: { include: { cohort: true } } },
    orderBy: { score: "desc" },
  });

  return NextResponse.json(submissions);
}
