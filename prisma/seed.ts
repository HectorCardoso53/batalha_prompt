import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

const JOGADORES = ["Jogador 01", "Jogador 02"];

async function main() {
  await prisma.challenge.updateMany({ where: { isActive: true }, data: { isActive: false } });

  const challenge = await prisma.challenge.create({
    data: {
      title: "Desafio Teste — Cidade Futurista",
      masterImage: "/prefeitura_oriximina.png",
      masterPrompt: "A futuristic city at sunset with flying cars and neon lights reflecting on wet streets, cinematic photography",
      isActive: true,
    },
  });

  const cohort = await prisma.cohort.create({
    data: { name: "Participantes", challengeId: challenge.id },
  });

  for (const nome of JOGADORES) {
    const slug = nome.toLowerCase().replace(/\s+/g, ".");
    await prisma.user.create({
      data: { name: nome, email: `${slug}@evento.local`, cohortId: cohort.id },
    });
    console.log("Jogador criado:", nome);
  }

  console.log("\nDesafio criado:", challenge.id);
  console.log("Home:  http://localhost:3000");
  console.log("Admin: http://localhost:3000/admin/desafio/" + challenge.id);
  console.log("Jogar: http://localhost:3000/jogar");
}

main().catch(console.error).finally(() => prisma.$disconnect());
