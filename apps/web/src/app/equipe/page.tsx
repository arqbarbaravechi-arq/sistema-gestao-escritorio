"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";

interface WorkloadEntry {
  userId: string;
  name: string;
  role: string;
  activeStages: number;
  lateStages: number;
}

const ROLE_LABELS: Record<string, string> = {
  SOCIA: "Sócia",
  ARQUITETA_JR: "Arquiteta Jr.",
  ESTAGIARIA: "Estagiária",
  ORCAMENTARIA: "Orçamentária",
  FINANCEIRO: "Financeiro",
};

export default function EquipePage() {
  const [workload, setWorkload] = useState<WorkloadEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<WorkloadEntry[]>("/team/workload")
      .then(setWorkload)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, []);

  const maxStages = Math.max(1, ...(workload ?? []).map((w) => w.activeStages));

  return (
    <AppShell>
      <div style={{ padding: "2rem 2.5rem", maxWidth: "720px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Equipe</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.4rem", fontSize: "0.85rem" }}>
          Carga de trabalho de cada pessoa — quantas etapas ativas estão sob sua responsabilidade
          em todos os projetos.
        </p>

        {error && <p style={{ color: "#c0392b", marginTop: "1rem" }}>{error}</p>}

        {!error && workload === null && (
          <p style={{ color: "var(--color-text-secondary)", marginTop: "1.5rem" }}>Carregando...</p>
        )}

        {workload && workload.length === 0 && (
          <div className="sga-card" style={{ marginTop: "1.5rem", color: "var(--color-text-secondary)" }}>
            Nenhum usuário cadastrado ainda.
          </div>
        )}

        {workload && workload.length > 0 && (
          <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {workload.map((w) => (
              <div key={w.userId} className="sga-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <span style={{ fontWeight: 700 }}>{w.name}</span>
                    <span style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginLeft: "0.5rem" }}>
                      {ROLE_LABELS[w.role] ?? w.role}
                    </span>
                  </div>
                  <span style={{ fontSize: "0.82rem", color: "var(--color-text-secondary)" }}>
                    {w.activeStages} etapa{w.activeStages === 1 ? "" : "s"} ativa
                    {w.activeStages === 1 ? "" : "s"}
                    {w.lateStages > 0 && (
                      <span style={{ color: "var(--color-danger)", fontWeight: 700 }}>
                        {" "}
                        · {w.lateStages} atrasada{w.lateStages === 1 ? "" : "s"}
                      </span>
                    )}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: "0.6rem",
                    height: "8px",
                    borderRadius: "999px",
                    background: "var(--color-bg-subtle)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${(w.activeStages / maxStages) * 100}%`,
                      background:
                        w.lateStages > 0
                          ? "var(--color-danger)"
                          : "linear-gradient(90deg, var(--color-primary), var(--color-accent-teal))",
                      borderRadius: "999px",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div
          className="sga-card"
          style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--color-text-secondary)" }}
        >
          🚧 Este painel só mostra dado real depois que alguém for atribuído como responsável por
          uma etapa, na tela do projeto.
        </div>
      </div>
    </AppShell>
  );
}
