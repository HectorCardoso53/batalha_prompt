"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Header() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  return (
    <header style={{
      position: "fixed",
      top: 0, left: 0, right: 0,
      zIndex: 1000,
      height: 64,
      background: "var(--azul-escuro)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 24px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>
      {/* Logo + nome */}
      <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
        {/* Logo da Prefeitura de Oriximiná */}
        <div style={{ width: 44, height: 44, flexShrink: 0 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/prefeitura_oriximina.png"
            alt="Prefeitura de Oriximiná"
            style={{ width: 44, height: 44, objectFit: "contain" }}
          />
        </div>
        <span style={{ color: "var(--texto-claro)", fontWeight: 700, fontSize: 15, lineHeight: 1.3 }}>
          Batalha de Prompt
        </span>
      </Link>

      {/* Navegação direita */}
      <nav style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Dropdown Admin */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-haspopup="true"
            style={{
              background: "var(--amarelo)",
              color: "var(--azul-escuro)",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              borderRadius: 8,
              padding: "8px 14px",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.2s",
            }}
          >
            Admin
            <span style={{
              display: "inline-block",
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              fontSize: 11,
            }}>▾</span>
          </button>

          {open && (
            <div style={{
              position: "absolute", top: "calc(100% + 6px)", right: 0,
              background: "var(--branco)",
              border: "1px solid var(--fundo-secao)",
              borderRadius: 8,
              boxShadow: "var(--shadow)",
              minWidth: 200,
              overflow: "hidden",
              zIndex: 100,
            }}>
              {[
                { href: "/admin", label: "Painel Admin" },
                { href: "/admin/novo-desafio", label: "+ Novo Desafio" },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  style={{
                    display: "block",
                    padding: "11px 16px",
                    color: "var(--azul-marinho)",
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: "none",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--fundo-secao)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
