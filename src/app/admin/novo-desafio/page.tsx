"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function NovoDesafioPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [masterPrompt, setMasterPrompt] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) { setError("Selecione uma imagem master."); return; }
    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("masterPrompt", masterPrompt);
    formData.append("masterImage", imageFile);

    const res = await fetch("/api/challenges", { method: "POST", body: formData });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Erro ao criar desafio.");
      setLoading(false);
      return;
    }

    const challenge = await res.json();
    router.push(`/admin/desafio/${challenge.id}`);
  }

  return (
    <div style={{ background: "var(--fundo)", minHeight: "100%", padding: "40px 24px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>

        <div style={{ marginBottom: 32 }}>
          <Link href="/admin" style={{ color: "var(--azul-royal)", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            ← Voltar ao Admin
          </Link>
          <h1 className="secao-titulo" style={{ textAlign: "left", marginTop: 12, marginBottom: 6 }}>Novo Desafio</h1>
          <div className="secao-traco" style={{ margin: "0" }} />
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            <div>
              <label style={{ display: "block", fontWeight: 700, color: "var(--azul-marinho)", fontSize: 14, marginBottom: 8 }}>
                Título do Desafio
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ex: Desafio #1 — Paisagem ao pôr do sol"
                className="input"
              />
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, color: "var(--azul-marinho)", fontSize: 14, marginBottom: 4 }}>
                Imagem Master
              </label>
              <p style={{ fontSize: 13, color: "var(--texto-sec)", marginBottom: 10 }}>
                Esta é a imagem que os jogadores vão tentar recriar com prompts.
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ fontSize: 14, color: "var(--texto)" }}
              />
              {preview && (
                <div style={{ marginTop: 14, borderRadius: 8, overflow: "hidden", border: "2px solid var(--ambar)" }}>
                  <Image src={preview} alt="Preview" width={600} height={400} style={{ width: "100%", objectFit: "contain", maxHeight: 260 }} />
                </div>
              )}
            </div>

            <div>
              <label style={{ display: "block", fontWeight: 700, color: "var(--azul-marinho)", fontSize: 14, marginBottom: 4 }}>
                Prompt Original <span style={{ color: "var(--texto-sec)", fontWeight: 400 }}>(secreto — não mostrado aos jogadores)</span>
              </label>
              <textarea
                value={masterPrompt}
                onChange={(e) => setMasterPrompt(e.target.value)}
                required
                rows={4}
                placeholder="Cole aqui o prompt exato que você usou para gerar a imagem master..."
                className="input"
                style={{ resize: "none" }}
              />
            </div>

            {error && (
              <p style={{ color: "#DC2626", fontSize: 14, background: "#FEE2E2", padding: "10px 14px", borderRadius: 8 }}>
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: "100%" }}>
              {loading ? "Criando desafio..." : "Criar Desafio"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
