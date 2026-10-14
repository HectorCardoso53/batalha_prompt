import type { Metadata } from "next";
import "./globals.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Batalha de Prompt",
  description: "Veja a imagem. Escreva o melhor prompt. Quem chegar mais perto ganha.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F4F6F8", color: "#333333" }}>
        <Header />
        <main style={{ flex: 1, paddingTop: "64px" }}>
          {children}
        </main>
        <footer style={{
          background: "var(--azul-escuro)",
          color: "var(--texto-claro)",
          textAlign: "center",
          padding: "28px 24px",
          fontSize: "13px",
        }}>
          <p style={{ fontWeight: 700, marginBottom: 6 }}>Batalha de Prompt</p>
          <p style={{ color: "rgba(255,255,255,0.5)" }}>© 2026 — Todos os direitos reservados</p>
        </footer>
      </body>
    </html>
  );
}
