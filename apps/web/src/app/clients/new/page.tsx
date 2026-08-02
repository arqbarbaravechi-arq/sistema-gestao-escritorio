"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Client } from "@/lib/types";

export default function NewClientPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch<Client>("/clients", {
        method: "POST",
        body: JSON.stringify({
          name,
          email: email || undefined,
          phone: phone || undefined,
        }),
      });
      router.push("/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "480px", margin: "3rem auto", padding: "0 1.5rem" }}>
      <Link href="/clients" style={{ color: "#666", fontSize: "0.85rem" }}>
        ← Voltar
      </Link>
      <h1 style={{ fontSize: "1.25rem", marginTop: "1rem" }}>Novo cliente</h1>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        Cadastre o cliente antes de criar o projeto dele.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Nome do cliente
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Rafael Souza"
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            E-mail (opcional)
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="rafael@exemplo.com"
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1.5rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Telefone (opcional)
          </span>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(48) 99999-8888"
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
          {loading ? "Cadastrando..." : "Cadastrar cliente"}
        </button>
      </form>
    </main>
  );
}
