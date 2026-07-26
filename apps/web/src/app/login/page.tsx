"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("socia@escritorio.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Credenciais inválidas");
      }

      const data = await response.json();
      // Armazenamento simples em memória via localStorage — aceitável
      // nesta fase de validação (Sprint 1); revisão de segurança de
      // sessão (cookie httpOnly) é item de arquitetura para quando o
      // frontend de produção for desenhado, não desta tela de teste.
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        maxWidth: "360px",
        margin: "4rem auto",
        padding: "2rem",
        border: "1px solid #e2e2e2",
        borderRadius: "8px",
      }}
    >
      <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>Entrar</h1>
      <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: "1.5rem" }}>
        Sistema de Gestão — Escritório de Arquitetura (versão de desenvolvimento)
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            E-mail
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Senha
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        {error && (
          <p style={{ color: "#c0392b", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p style={{ fontSize: "0.75rem", color: "#999", marginTop: "1.5rem" }}>
        Ambiente de desenvolvimento. Usuário de teste:{" "}
        <code>socia@escritorio.com</code> / <code>senha123</code>
      </p>
    </main>
  );
}
