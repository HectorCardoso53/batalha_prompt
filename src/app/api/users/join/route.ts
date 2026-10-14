import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const challenge = await prisma.challenge.findFirst({
    where: { isActive: true },
    include: { cohorts: { include: { users: true } } },
  });
  if (!challenge) return NextResponse.json([], { status: 200 });
  const users = challenge.cohorts.flatMap((c) => c.users);
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const { name } = await req.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
  }

  const challenge = await prisma.challenge.findFirst({
    where: { isActive: true },
    include: { cohorts: true },
  });

  if (!challenge) {
    return NextResponse.json({ error: "Nenhum desafio ativo." }, { status: 404 });
  }

  // Garante que existe um cohort (cria "Participantes" se não houver nenhum)
  let cohort = challenge.cohorts[0];
  if (!cohort) {
    cohort = await prisma.cohort.create({
      data: { name: "Participantes", challengeId: challenge.id },
    });
  }

  // Email único gerado automaticamente
  const slug = name.trim().toLowerCase().replace(/\s+/g, ".").replace(/[^a-z0-9.]/g, "");
  const email = `${slug}.${Date.now()}@evento.local`;

  const user = await prisma.user.create({
    data: { name: name.trim(), email, cohortId: cohort.id },
  });

  return NextResponse.json({ ...user, challengeId: challenge.id }, { status: 201 });
}
