"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Cohort { id: string; name: string; }
interface User { id: string; name: string; cohort: Cohort; }
interface Submission {
  id: string; user: User; prompt: string;
  generatedImage: string; score: number | null; createdAt: string;
}

export default function LeaderboardPage() {
  const { challengeId } = useParams<{ challengeId: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [challengeTitle, setChallengeTitle] = useState("");

  useEffect(() => {
    fetch(`/api/leaderboard/${challengeId}`)
      .then((r) => r.json())
      .then((data) => { setSubmissions(data); setLoading(false); });

    fetch(`/api/challenges/${challengeId}`)
      .then((r) => r.json())
      .then((data) => setChallengeTitle(data.title ?? ""));
  }, [challengeId]);

  const scoreColor = (s: number | null) =>
    s == null ? "var(--texto-sec)" : s >= 70 ? "#065F46" : s >= 40 ? "#92400E" : "#991B1B";
  const scoreBg = (s: number | null) =>
    s == null ? "var(--fundo-secao)" : s >= 70 ? "#D1FAE5" : s >= 40 ? "#FEF3C7" : "#FEE2E2";

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div style={{ background: "var(--fundo)", minHeight: "100%", padding: "40px 24px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Cabeçalho */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ color: "var(--azul-royal)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            ← Início
          </Link>
          <h1 className="secao-titulo" style={{ textAlign: "left", marginTop: 10, marginBottom: 6 }}>Ranking</h1>
          {challengeTitle && (
            <p style={{ fontSize: 14, color: "var(--texto-sec)" }}>{challengeTitle}</p>
          )}
          <div className="secao-traco" style={{ margin: "8px 0 0" }} />
        </div>

        {loading ? (
          <p style={{ color: "var(--texto-sec)", textAlign: "center", padding: "48px 0" }}>Carregando...</p>
        ) : submissions.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
            <p style={{ fontSize: 18, color: "var(--texto-sec)" }}>Nenhuma submissão ainda.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {submissions.map((sub, i) => {
              const score = sub.score ?? 0;
              const isFirst = i === 0;

              return (
                <div
                  key={sub.id}
                  className="card"
                  style={{
                    display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap",
                    border: isFirst ? `2px solid var(--amarelo)` : "2px solid transparent",
                    background: isFirst ? "var(--fundo-off-white)" : "var(--branco)",
                  }}
                >
                  {/* Posição */}
                  <div style={{ width: 40, textAlign: "center", flexShrink: 0 }}>
                    {medals[i] ? (
                      <span style={{ fontSize: 28 }}>{medals[i]}</span>
                    ) : (
                      <span style={{ fontSize: 18, fontWeight: 900, color: "var(--texto-sec)" }}>{i + 1}</span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div style={{ width: 80, height: 56, borderRadius: 8, overflow: "hidden", border: "1px solid var(--fundo-secao)", flexShrink: 0 }}>
                    <Image
                      src={sub.generatedImage}
                      alt="Gerada"
                      width={80}
                      height={56}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                      <p style={{ fontWeight: 700, color: "var(--azul-marinho)", fontSize: 15 }}>{sub.user.name}</p>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                        background: "var(--fundo-secao)", color: "var(--texto-sec)",
                      }}>
                        {sub.user.cohort.name}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 13, color: "var(--texto-sec)", lineHeight: 1.4,
                      display: "-webkit-box", WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical", overflow: "hidden",
                    }}>
                      {sub.prompt}
                    </p>
                  </div>

                  {/* Score */}
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{
                      display: "inline-flex", flexDirection: "column", alignItems: "center",
                      background: scoreBg(sub.score), borderRadius: 10,
                      padding: "6px 16px",
                    }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: scoreColor(sub.score), lineHeight: 1 }}>
                        {score.toFixed(0)}
                      </span>
                      <span style={{ fontSize: 11, color: "var(--texto-sec)", fontWeight: 700 }}>/100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: 32, display: "flex", gap: 14 }}>
          <Link href="/jogar" className="btn btn-primary">Jogar também</Link>
          <Link href="/admin" className="btn btn-secondary">Admin</Link>
        </div>
      </div>
    </div>
  );
}
