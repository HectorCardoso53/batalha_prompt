"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";

interface User { id: string; name: string; email: string; }
interface Cohort { id: string; name: string; users: User[]; }
interface Submission { id: string; user: User; prompt: string; generatedImage: string; score: number | null; createdAt: string; }
interface Challenge {
  id: string; title: string; masterImage: string; masterPrompt: string;
  isActive: boolean; cohorts: Cohort[]; submissions: Submission[];
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 14,
  color: "var(--texto-destaque)",
  background: "var(--fundo)",
  border: "1.5px solid #CBD5E0",
  borderRadius: 8,
  padding: "9px 12px",
};

function AdminDesafioContent() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ text: "", ok: true });
  const [showQR, setShowQR] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editPrompt, setEditPrompt] = useState("");

  useEffect(() => {
    fetch(`/api/challenges/${id}`)
      .then((r) => r.json())
      .then((data) => { setChallenge(data); setLoading(false); });
  }, [id]);

  function flash(text: string, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg({ text: "", ok: true }), 2500);
  }

  async function saveEdit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`/api/challenges/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle, masterPrompt: editPrompt }),
    });
    if (!res.ok) { flash("Erro ao salvar.", false); return; }
    setChallenge((prev) => prev ? { ...prev, title: editTitle, masterPrompt: editPrompt } : prev);
    setEditing(false);
    flash("Desafio atualizado!");
  }


  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--texto-sec)" }}>
      Carregando...
    </div>
  );
  if (!challenge) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "#DC2626" }}>
      Desafio não encontrado.
    </div>
  );

  const scoreColor = (s: number | null) =>
    s == null ? "var(--texto-sec)" : s >= 70 ? "#065F46" : s >= 40 ? "#92400E" : "#991B1B";
  const scoreBg = (s: number | null) =>
    s == null ? "var(--fundo-secao)" : s >= 70 ? "#D1FAE5" : s >= 40 ? "#FEF3C7" : "#FEE2E2";

  return (
    <div style={{ background: "var(--fundo)", minHeight: "100%", padding: "40px 24px" }}>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Cabeçalho */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/admin" style={{ color: "var(--azul-royal)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            ← Voltar ao Admin
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <h1 style={{ fontWeight: 700, fontSize: 24, color: "var(--azul-marinho)" }}>{challenge.title}</h1>
            <button
              onClick={() => { setEditTitle(challenge.title); setEditPrompt(challenge.masterPrompt); setEditing(true); }}
              className="btn"
              style={{ padding: "6px 14px", fontSize: 12, background: "var(--fundo-secao)", color: "var(--azul-marinho)", display: "flex", alignItems: "center", gap: 6 }}
            >
              <i className="bi bi-pencil" /> Editar
            </button>
          </div>
        </div>

        {/* Imagem + prompt */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 28 }}>
          <div className="card">
            <p style={{ fontWeight: 700, color: "var(--texto-sec)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Imagem Master
            </p>
            <div style={{ borderRadius: 8, overflow: "hidden", border: "2px solid var(--ambar)" }}>
              <Image src={challenge.masterImage} alt="Master" width={500} height={400} style={{ width: "100%", objectFit: "contain", maxHeight: 220 }} />
            </div>
          </div>
          <div className="card">
            <p style={{ fontWeight: 700, color: "var(--texto-sec)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
              Prompt Original (secreto)
            </p>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: "var(--texto)", background: "var(--fundo)", padding: "12px", borderRadius: 8, borderLeft: "3px solid var(--ambar)" }}>
              {challenge.masterPrompt}
            </p>
            <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
              <Link href={`/leaderboard/${challenge.id}`} className="btn btn-primary" style={{ padding: "8px 16px", fontSize: 13 }}>
                Ver Ranking
              </Link>
              <Link href={`/jogar?challengeId=${challenge.id}`} className="btn btn-secondary" style={{ padding: "8px 16px", fontSize: 13 }}>
                Ver Jogo
              </Link>
              <button
                onClick={() => setShowQR(true)}
                className="btn"
                style={{ padding: "8px 16px", fontSize: 13, background: "var(--fundo-secao)", color: "var(--azul-marinho)", display: "flex", alignItems: "center", gap: 6 }}
              >
                <i className="bi bi-qr-code" />
                QR Code
              </button>
            </div>
          </div>
        </div>

        {/* Modal de edição */}
        {editing && (
          <div onClick={() => setEditing(false)} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: "32px 28px", width: "90%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>
              <h2 style={{ fontWeight: 700, fontSize: 18, color: "var(--azul-marinho)", marginBottom: 20 }}>Editar Desafio</h2>
              <form onSubmit={saveEdit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--texto-sec)", marginBottom: 6, textTransform: "uppercase" }}>Título</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                    style={{ ...inputStyle, background: "#fff" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontWeight: 700, fontSize: 12, color: "var(--texto-sec)", marginBottom: 6, textTransform: "uppercase" }}>Prompt Original (secreto)</label>
                  <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    required
                    rows={5}
                    style={{ ...inputStyle, background: "#fff", resize: "vertical" }}
                  />
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary" style={{ padding: "9px 20px", fontSize: 14 }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: "9px 20px", fontSize: 14 }}>Salvar</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Mensagem flash */}
        {msg.text && (
          <div style={{
            padding: "10px 16px", borderRadius: 8, marginBottom: 20, fontSize: 14, fontWeight: 700,
            background: msg.ok ? "#D1FAE5" : "#FEE2E2",
            color: msg.ok ? "#065F46" : "#991B1B",
          }}>
            {msg.text}
          </div>
        )}

        {/* Submissões */}
        {challenge.submissions.length > 0 && (
          <div className="card">
            <h2 style={{ fontWeight: 700, color: "var(--azul-marinho)", fontSize: 18, marginBottom: 20 }}>
              Submissões ({challenge.submissions.length})
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
              {challenge.submissions.map((sub) => (
                <div key={sub.id} style={{ background: "var(--fundo)", borderRadius: 10, overflow: "hidden", border: "1px solid var(--fundo-secao)" }}>
                  <Image src={sub.generatedImage} alt="Gerada" width={300} height={200} style={{ width: "100%", objectFit: "cover", maxHeight: 160 }} />
                  <div style={{ padding: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: "var(--azul-marinho)" }}>{sub.user.name}</p>
                      <span style={{
                        fontWeight: 900, fontSize: 16,
                        color: scoreColor(sub.score),
                        background: scoreBg(sub.score),
                        padding: "2px 10px", borderRadius: 99,
                      }}>
                        {sub.score?.toFixed(0) ?? "—"}/100
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: "var(--texto-sec)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {sub.prompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal QR Code */}
      {showQR && (
      <div
        onClick={() => setShowQR(false)}
        style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(0,0,0,0.65)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "#fff", borderRadius: 16, padding: "36px 40px",
            textAlign: "center", boxShadow: "0 24px 64px rgba(0,0,0,0.3)",
            maxWidth: 340, width: "90%",
          }}
        >
          <p style={{ fontWeight: 700, fontSize: 16, color: "var(--azul-marinho)", marginBottom: 6 }}>
            Escaneie para jogar
          </p>
          <p style={{ fontSize: 12, color: "var(--texto-sec)", marginBottom: 20 }}>
            Aponte a câmera do celular para o código abaixo
          </p>
          <div style={{ display: "inline-block", padding: 12, border: "3px solid var(--ambar)", borderRadius: 12 }}>
            <QRCodeSVG
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/jogar`}
              size={220}
              bgColor="#ffffff"
              fgColor="#001B3D"
              level="M"
            />
          </div>
          <p style={{ fontSize: 11, color: "var(--texto-sec)", marginTop: 16, wordBreak: "break-all" }}>
            {`${typeof window !== "undefined" ? window.location.origin : ""}/jogar`}
          </p>
          <button
            onClick={() => setShowQR(false)}
            className="btn btn-secondary"
            style={{ marginTop: 20, padding: "8px 28px", fontSize: 14 }}
          >
            Fechar
          </button>
        </div>
      </div>
    )}
    </div>
  );
}

export default function AdminDesafioPage() {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", color: "var(--texto-sec)" }}>
        Carregando...
      </div>
    }>
      <AdminDesafioContent />
    </Suspense>
  );
}
