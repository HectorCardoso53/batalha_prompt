import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, challengeId } = body;

  if (!name || !challengeId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const cohort = await prisma.cohort.create({
    data: { name, challengeId },
  });

  return NextResponse.json(cohort, { status: 201 });
}
