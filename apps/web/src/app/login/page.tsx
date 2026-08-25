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
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-subtle)",
        padding: "1.5rem",
      }}
    >
      <div
        className="sga-card"
        style={{ width: "100%", maxWidth: "380px", padding: "2rem" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1.5rem" }}>
          <span className="sga-nav-logo-mark" />
          <span className="sga-nav-logo-text" style={{ fontSize: "1.1rem" }}>
            Sistema de Gestão
          </span>
        </div>

        <h1 style={{ fontSize: "1.1rem", margin: "0 0 0.25rem" }}>Entrar</h1>
        <p style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem" }}>
          Escritório de Arquitetura
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: "0.85rem" }}>
            <span style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem", fontWeight: 600 }}>
              E-mail
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="sga-input"
            />
          </label>

          <label style={{ display: "block", marginBottom: "1.2rem" }}>
            <span style={{ display: "block", fontSize: "0.8rem", marginBottom: "0.3rem", fontWeight: 600 }}>
              Senha
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="sga-input"
            />
          </label>

          {error && (
            <p style={{ color: "#c0392b", fontSize: "0.82rem", marginBottom: "1rem" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="sga-btn sga-btn-primary"
            style={{ width: "100%", padding: "0.7rem" }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={{ fontSize: "0.72rem", color: "var(--color-text-muted)", marginTop: "1.5rem" }}>
          Ambiente de desenvolvimento. Usuário de teste:{" "}
          <code>socia@escritorio.com</code> / <code>senha123</code>
        </p>
      </div>
    </main>
  );
}
