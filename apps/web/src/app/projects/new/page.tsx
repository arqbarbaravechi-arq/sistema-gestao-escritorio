"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Project, ProjectType, PROJECT_TYPE_LABELS } from "@/lib/types";

const TYPES: ProjectType[] = ["INTERIORES", "ARQUITETONICO", "COMERCIAL", "CONSULTORIA"];

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("INTERIORES");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await apiFetch<{ project: Project }>("/projects", {
        method: "POST",
        body: JSON.stringify({ name, type }),
      });
      router.push(`/projects/${result.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar projeto");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "480px", margin: "3rem auto", padding: "0 1.5rem" }}>
      <Link href="/dashboard" style={{ color: "#666", fontSize: "0.85rem" }}>
        ← Voltar
      </Link>
      <h1 style={{ fontSize: "1.25rem", marginTop: "1rem" }}>Novo projeto</h1>
      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        As 8 etapas padrão (Briefing até Entrega) são criadas automaticamente.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Nome do projeto
          </span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Ex: Casa Boa Vista"
            style={{ width: "100%", padding: "0.5rem", boxSizing: "border-box" }}
          />
        </label>

        <label style={{ display: "block", marginBottom: "1.5rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>Tipo</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ProjectType)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {PROJECT_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
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
          {loading ? "Criando..." : "Criar projeto"}
        </button>
      </form>
    </main>
  );
}
