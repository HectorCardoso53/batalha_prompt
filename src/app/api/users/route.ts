import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, cohortId } = body;

  if (!name || !email || !cohortId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: { name, email, cohortId },
    });
    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  }
}
