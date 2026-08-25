"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const ORIGINS = [
  { value: "INSTAGRAM_ORGANICO", label: "Instagram (orgânico)" },
  { value: "INSTAGRAM_PAGO", label: "Instagram (pago)" },
  { value: "INDICACAO", label: "Indicação" },
  { value: "OUTRO", label: "Outro" },
];

export default function NewLeadPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [origin, setOrigin] = useState("INDICACAO");
  const [projectType, setProjectType] = useState("");
  const [budgetRange, setBudgetRange] = useState("");
  const [desiredDeadline, setDesiredDeadline] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await apiFetch("/leads", {
        method: "POST",
        body: JSON.stringify({
          name,
          contact: contact || undefined,
          origin,
          projectType: projectType || undefined,
          budgetRange: budgetRange || undefined,
          desiredDeadline: desiredDeadline || undefined,
        }),
      });
      router.push("/crm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar lead");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "480px", margin: "3rem auto", padding: "0 1.5rem" }}>
      <Link href="/crm" style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
        ← Voltar
      </Link>
      <h1 style={{ fontSize: "1.25rem", marginTop: "1rem" }}>Novo lead</h1>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Nome</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Contato (opcional)
          </span>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Telefone ou e-mail"
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Origem
          </span>
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            {ORIGINS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Tipo de projeto (opcional)
          </span>
          <input
            type="text"
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
            placeholder="Ex: Apartamento, casa..."
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Faixa de investimento (opcional)
          </span>
          <input
            type="text"
            value={budgetRange}
            onChange={(e) => setBudgetRange(e.target.value)}
            placeholder="Ex: R$40-60k"
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1.5rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Prazo desejado (opcional)
          </span>
          <input
            type="text"
            value={desiredDeadline}
            onChange={(e) => setDesiredDeadline(e.target.value)}
            placeholder="Ex: 3 meses"
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        {error && (
          <p style={{ color: "var(--color-danger)", fontSize: "0.85rem", marginBottom: "1rem" }}>{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.6rem",
            background: "#111111",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            cursor: "pointer",
          }}
        >
          {loading ? "Criando..." : "Criar lead"}
        </button>
      </form>
    </main>
  );
}
