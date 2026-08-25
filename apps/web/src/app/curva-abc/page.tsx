"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Project } from "@/lib/types";

interface AbcItem {
  quoteId: string;
  category: string;
  value: number;
  percentage: number;
  cumulativePercentage: number;
  classification: "A" | "B" | "C";
}

interface AbcCurve {
  totalValue: number;
  items: AbcItem[];
  summary: { countA: number; countB: number; countC: number };
}

const CATEGORY_LABELS: Record<string, string> = {
  MARCENARIA: "Marcenaria",
  MARMORARIA: "Marmoraria",
  OBRA_CIVIL: "Obra civil",
  OUTRO: "Outro",
};

const CLASS_COLOR: Record<string, string> = {
  A: "#dc2626",
  B: "#d97706",
  C: "#16a34a",
};

export default function CurvaAbcPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState("");
  const [curve, setCurve] = useState<AbcCurve | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Project[]>("/projects")
      .then(setProjects)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!projectId) {
      setCurve(null);
      return;
    }
    apiFetch<AbcCurve>(`/projects/${projectId}/abc-curve`)
      .then(setCurve)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, [projectId]);

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "640px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Curva ABC de Custos</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.5rem", fontSize: "0.85rem" }}>
          Classifica as cotações já aprovadas de um projeto por impacto financeiro — Classe A
          (maior impacto, até 80% do custo acumulado), Classe B (até 95%) e Classe C (os 5%
          finais).
        </p>

        <select
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", marginTop: "1rem" }}
        >
          <option value="">Selecione um projeto</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {error && <p style={{ color: "var(--color-danger)", marginTop: "1rem" }}>{error}</p>}

        {curve && curve.items.length === 0 && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1.5rem",
              border: "1px dashed #ccc",
              borderRadius: "12px",
              color: "var(--color-text-secondary)",
              fontSize: "0.85rem",
            }}
          >
            Nenhuma cotação aprovada neste projeto ainda — aprove cotações na tela do projeto
            para a curva aparecer aqui.
          </div>
        )}

        {curve && curve.items.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
              {(["A", "B", "C"] as const).map((cls) => (
                <div
                  key={cls}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "12px",
                    background: "var(--color-bg-subtle)",
                    textAlign: "center",
                  }}
                >
                  <div style={{ color: CLASS_COLOR[cls], fontWeight: "bold", fontSize: "1.1rem" }}>
                    Classe {cls}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
                    {curve.summary[`count${cls}` as keyof typeof curve.summary]} ite
                    {curve.summary[`count${cls}` as keyof typeof curve.summary] === 1 ? "m" : "ns"}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
              Total aprovado: <strong>R$ {curve.totalValue.toLocaleString("pt-BR")}</strong>
            </div>

            {curve.items.map((item) => (
              <div
                key={item.quoteId}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.6rem 0.8rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  marginBottom: "0.4rem",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.85rem" }}>
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    R$ {item.value.toLocaleString("pt-BR")} ({item.percentage}% do total) ·
                    acumulado {item.cumulativePercentage}%
                  </div>
                </div>
                <span
                  style={{
                    fontWeight: "bold",
                    color: "#fff",
                    background: CLASS_COLOR[item.classification],
                    borderRadius: "999px",
                    padding: "0.2rem 0.6rem",
                    fontSize: "0.8rem",
                  }}
                >
                  {item.classification}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
