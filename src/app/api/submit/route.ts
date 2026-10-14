import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateImage, scoreImageSimilarity } from "@/lib/openai";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, challengeId, prompt } = body;

  if (!userId || !challengeId || !prompt) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
  if (!challenge) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
  if (!challenge.isActive) return NextResponse.json({ error: "Challenge is not active" }, { status: 403 });

  const existing = await prisma.submission.findFirst({ where: { userId, challengeId } });
  if (existing) return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  // Generate image with DALL-E
  const generatedImageUrl = await generateImage(prompt);

  // Download and save generated image locally
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });

  const imgResponse = await fetch(generatedImageUrl);
  const imgBuffer = Buffer.from(await imgResponse.arrayBuffer());
  const filename = `gen-${userId}-${Date.now()}.png`;
  await writeFile(path.join(uploadDir, filename), imgBuffer);
  const localGeneratedPath = `/uploads/${filename}`;

  // Score similarity
  const masterUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}${challenge.masterImage}`;
  const score = await scoreImageSimilarity(masterUrl, generatedImageUrl);

  const submission = await prisma.submission.create({
    data: {
      userId,
      challengeId,
      prompt,
      generatedImage: localGeneratedPath,
      score,
    },
    include: { user: true },
  });

  return NextResponse.json(submission, { status: 201 });
}
