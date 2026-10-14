import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function GET() {
  const challenges = await prisma.challenge.findMany({
    include: { cohorts: { include: { users: true } }, _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(challenges);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const title = formData.get("title") as string;
  const masterPrompt = formData.get("masterPrompt") as string;
  const imageFile = formData.get("masterImage") as File;

  if (!title || !masterPrompt || !imageFile) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const bytes = await imageFile.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const filename = `master-${Date.now()}-${imageFile.name.replace(/\s/g, "_")}`;
  await writeFile(path.join(uploadDir, filename), buffer);

  const challenge = await prisma.challenge.create({
    data: {
      title,
      masterPrompt,
      masterImage: `/uploads/${filename}`,
    },
  });

  return NextResponse.json(challenge, { status: 201 });
}
