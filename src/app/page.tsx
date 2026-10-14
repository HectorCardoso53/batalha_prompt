"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Challenge {
  id: string;
  title: string;
  masterImage: string;
  isActive: boolean;
}

export default function Home() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((data: Challenge[]) => {
        setChallenge(data.find((c) => c.isActive) ?? null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100%", background: "var(--azul-escuro)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <i className="bi bi-hourglass-split" style={{ fontSize: 48, color: "var(--amarelo)" }} />
    </div>
  );

  if (!challenge) return (
    <div style={{ minHeight: "100%", background: "var(--azul-escuro)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center", color: "#fff" }}>
        <i className="bi bi-hourglass" style={{ fontSize: 52, color: "var(--ambar)", display: "block", marginBottom: 16 }} />
        <h2 style={{ fontWeight: 700, fontSize: 22, marginBottom: 8 }}>Aguardando rodada...</h2>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 15 }}>O admin ainda não ativou nenhum desafio.</p>
      </div>
    </div>
  );

  return (
    <div style={{
      height: "calc(100vh - 64px)",
      background: "var(--azul-escuro)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px 24px",
      gap: 16,
      overflow: "hidden",
    }}>

      {/* Título */}
      <h1 style={{
        color: "#fff",
        fontWeight: 700,
        fontSize: "clamp(16px, 2vw, 28px)",
        textAlign: "center",
        flexShrink: 0,
      }}>
        {challenge.title}
      </h1>

      {/* Imagem completa — limitada à altura disponível */}
      <div style={{
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 8px 40px rgba(0,0,0,0.4)",
        flex: "1 1 auto",
        minHeight: 0,
        display: "flex",
        alignItems: "center",
      }}>
        <Image
          src={challenge.masterImage}
          alt="Imagem da rodada"
          width={600}
          height={600}
          style={{ maxHeight: "calc(100vh - 180px)", width: "auto", height: "100%", display: "block" }}
          priority
        />
      </div>

    </div>
  );
}
