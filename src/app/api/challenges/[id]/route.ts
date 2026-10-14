import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const challenge = await prisma.challenge.findUnique({
    where: { id },
    include: {
      cohorts: { include: { users: true } },
      submissions: { include: { user: true }, orderBy: { score: "desc" } },
    },
  });
  if (!challenge) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(challenge);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.title !== undefined) data.title = body.title;
  if (body.masterPrompt !== undefined) data.masterPrompt = body.masterPrompt;
  const challenge = await prisma.challenge.update({ where: { id }, data });
  return NextResponse.json(challenge);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cohorts = await prisma.cohort.findMany({ where: { challengeId: id }, select: { id: true } });
  const cohortIds = cohorts.map((c) => c.id);
  await prisma.submission.deleteMany({ where: { challengeId: id } });
  await prisma.user.deleteMany({ where: { cohortId: { in: cohortIds } } });
  await prisma.cohort.deleteMany({ where: { challengeId: id } });
  await prisma.challenge.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
