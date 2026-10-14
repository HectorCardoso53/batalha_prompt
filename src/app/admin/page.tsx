"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Challenge {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  _count: { submissions: number };
  cohorts: { id: string; name: string; users: unknown[] }[];
}

export default function AdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((data) => { setChallenges(data); setLoading(false); });
  }, []);

  async function toggleActive(id: string, current: boolean) {
    await fetch(`/api/challenges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !current }),
    });
    setChallenges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !current } : c))
    );
  }

  async function deleteChallenge(id: string) {
    if (!confirm("Deletar este desafio?")) return;
    await fetch(`/api/challenges/${id}`, { method: "DELETE" });
    setChallenges((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div style={{ background: "var(--fundo)", minHeight: "100%", padding: "40px 24px" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Cabeçalho da seção */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 className="secao-titulo" style={{ textAlign: "left", marginBottom: 6 }}>Painel Admin</h1>
            <div className="secao-traco" style={{ margin: "0 0 0 0" }} />
          </div>
          <Link href="/admin/novo-desafio" className="btn btn-primary" style={{ whiteSpace: "nowrap" }}>
            + Novo Desafio
          </Link>
        </div>

        {loading ? (
          <p style={{ color: "var(--texto-sec)", textAlign: "center", padding: "48px 0" }}>Carregando...</p>
        ) : challenges.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "64px 24px" }}>
            <p style={{ fontSize: 18, color: "var(--texto-sec)", marginBottom: 16 }}>Nenhum desafio criado ainda.</p>
            <Link href="/admin/novo-desafio" className="btn btn-primary">Criar o primeiro desafio</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {challenges.map((c) => (
              <div key={c.id} className="card" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <h2 style={{ fontWeight: 700, color: "var(--azul-marinho)", fontSize: 18 }}>{c.title}</h2>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--texto-sec)" }}>
                    {c.cohorts.length} cohort(s) · {c._count.submissions} submissão(ões)
                  </p>
                </div>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link href={`/admin/desafio/${c.id}`} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>
                    Gerenciar
                  </Link>
                  <Link href={`/leaderboard/${c.id}`} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>
                    Ranking
                  </Link>
                  <button
                    onClick={() => toggleActive(c.id, c.isActive)}
                    className="btn btn-secondary"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    {c.isActive ? "Pausar" : "Ativar"}
                  </button>
                  <button
                    onClick={() => deleteChallenge(c.id)}
                    className="btn btn-secondary"
                    style={{ padding: "8px 16px", fontSize: 13 }}
                  >
                    Deletar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
