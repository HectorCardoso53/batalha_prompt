"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Challenge { id: string; title: string; masterImage: string; isActive: boolean; }
interface Submission { id: string; prompt: string; generatedImage: string; score: number | null; }

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 15,
  color: "var(--texto-destaque)",
  background: "var(--branco)",
  border: "1.5px solid #CBD5E0",
  borderRadius: 8,
  padding: "11px 14px",
};

function JogarContent() {
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challengeId");

  const [step, setStep] = useState<"login" | "game" | "result">("login");
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/challenges")
      .then((r) => r.json())
      .then((data: Challenge[]) => {
        const active = data.filter((c) => c.isActive);
        setChallenges(active);
        if (challengeId) {
          const found = active.find((c) => c.id === challengeId);
          if (found) setSelectedChallenge(found);
        }
      });
  }, [challengeId]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/users/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao entrar.");
      setLoading(false);
      return;
    }
    const user = await res.json();
    setUserId(user.id);
    setUserName(user.name);
    if (!selectedChallenge) {
      const found = challenges.find((c) => c.id === user.challengeId);
      if (found) setSelectedChallenge(found);
    }
    setStep("game");
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedChallenge) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, challengeId: selectedChallenge.id, prompt }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Erro ao enviar."); setLoading(false); return; }
    setSubmission(data);
    setStep("result");
    setLoading(false);
  }

  /* ── LOGIN ─────────────────────────────────────────── */
  if (step === "login") {
    return (
      <div style={{ background: "var(--fundo)", minHeight: "100%", display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          <h1 className="secao-titulo" style={{ marginBottom: 6 }}>Entrar na Batalha</h1>
          <div className="secao-traco" />

          {challenges.length === 0 && (
            <div style={{ background: "#FEF3C7", border: "1px solid var(--ambar)", borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#92400E" }}>
              Nenhum desafio ativo. Aguarde o admin iniciar uma rodada.
            </div>
          )}

          <div className="card">
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "var(--azul-marinho)", marginBottom: 6 }}>Seu nome</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: João Silva" style={inputStyle} />
              </div>
              {error && <p style={{ color: "#DC2626", fontSize: 13 }}>{error}</p>}
              <button type="submit" disabled={loading || challenges.length === 0} className="btn btn-primary" style={{ width: "100%" }}>
                {loading ? "Entrando..." : "Entrar no desafio"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ── JOGO ──────────────────────────────────────────── */
  if (step === "game" && selectedChallenge) {
    return (
      <div style={{ background: "var(--fundo)", minHeight: "100%", padding: "40px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 13, color: "var(--texto-sec)" }}>
              Jogando como <strong style={{ color: "var(--azul-marinho)" }}>{userName}</strong>
            </p>
            <h1 style={{ fontWeight: 700, fontSize: 22, color: "var(--azul-marinho)" }}>{selectedChallenge.title}</h1>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
            {/* Imagem Master */}
            <div className="card">
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-sec)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Imagem Master — tente recriar esta imagem
              </p>
              <div style={{ borderRadius: 8, overflow: "hidden", border: "2px solid var(--ambar)" }}>
                <Image src={selectedChallenge.masterImage} alt="Imagem Master" width={512} height={512} style={{ width: "100%", objectFit: "contain" }} />
              </div>
            </div>

            {/* Prompt */}
            <div className="card" style={{ display: "flex", flexDirection: "column" }}>
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-sec)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>
                Seu Prompt
              </p>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  rows={10}
                  placeholder="Descreva a imagem com o máximo de detalhes — cores, composição, estilo, objetos, iluminação..."
                  style={{ ...inputStyle, resize: "none", flex: 1 }}
                />
                {error && <p style={{ color: "#DC2626", fontSize: 13 }}>{error}</p>}
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%" }}>
                  {loading ? "Gerando imagem e calculando score..." : "Enviar Prompt"}
                </button>
                {loading && (
                  <p style={{ fontSize: 12, color: "var(--texto-sec)", textAlign: "center" }}>
                    Isso pode levar até 30 segundos. Aguarde...
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── RESULTADO ─────────────────────────────────────── */
  if (step === "result" && submission && selectedChallenge) {
    const score = submission.score ?? 0;
    const scoreColor = score >= 70 ? "#065F46" : score >= 40 ? "#92400E" : "#991B1B";
    const scoreBg   = score >= 70 ? "#D1FAE5" : score >= 40 ? "#FEF3C7" : "#FEE2E2";

    return (
      <div style={{ background: "var(--fundo)", minHeight: "100%", padding: "40px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <h1 className="secao-titulo" style={{ textAlign: "left", marginBottom: 6 }}>Resultado</h1>
          <div className="secao-traco" style={{ margin: "0 0 24px" }} />

          {/* Score em destaque */}
          <div className="card" style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 24, flexWrap: "wrap" }}>
            <div>
              <p style={{ fontSize: 13, color: "var(--texto-sec)", fontWeight: 700, marginBottom: 4 }}>Sua pontuação de similaridade</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontSize: 64, fontWeight: 900, color: scoreColor }}>{score.toFixed(0)}</span>
                <span style={{ fontSize: 24, color: "var(--texto-sec)", fontWeight: 700 }}>/100</span>
              </div>
            </div>
            <div style={{
              flex: 1, minWidth: 200,
              background: scoreBg, borderRadius: 10, padding: "16px 20px",
              color: scoreColor, fontWeight: 700, fontSize: 15,
            }}>
              {score >= 70 ? "🎉 Excelente! Sua imagem ficou muito parecida com a original." :
               score >= 40 ? "👍 Bom trabalho! Você capturou parte da essência da imagem." :
               "💪 Continue tentando! Detalhe mais a composição e os elementos."}
            </div>
          </div>

          {/* Comparação lado a lado */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
            <div className="card">
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-sec)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Imagem Master</p>
              <div style={{ borderRadius: 8, overflow: "hidden", border: "2px solid var(--ambar)" }}>
                <Image src={selectedChallenge.masterImage} alt="Master" width={512} height={512} style={{ width: "100%", objectFit: "contain" }} />
              </div>
            </div>
            <div className="card">
              <p style={{ fontWeight: 700, fontSize: 12, color: "var(--texto-sec)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>Sua Geração</p>
              <div style={{ borderRadius: 8, overflow: "hidden", border: "2px solid var(--azul-ceu)" }}>
                <Image src={submission.generatedImage} alt="Gerada" width={512} height={512} style={{ width: "100%", objectFit: "contain" }} />
              </div>
            </div>
          </div>

          {/* Prompt enviado */}
          <div className="card" style={{ marginBottom: 24 }}>
            <p style={{ fontWeight: 700, fontSize: 13, color: "var(--texto-sec)", marginBottom: 6 }}>Prompt enviado:</p>
            <p style={{ fontSize: 14, color: "var(--texto)", lineHeight: 1.6, borderLeft: "3px solid var(--ambar)", paddingLeft: 14 }}>
              {submission.prompt}
            </p>
          </div>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Link href={`/leaderboard/${selectedChallenge.id}`} className="btn btn-primary">Ver Ranking</Link>
            <Link href="/" className="btn btn-secondary">Início</Link>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default function JogarPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--texto-sec)" }}>
        Carregando...
      </div>
    }>
      <JogarContent />
    </Suspense>
  );
}
