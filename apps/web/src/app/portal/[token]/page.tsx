"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface PublicStage {
  type: string;
  status: string;
  mode: string;
}

interface PublicProject {
  projectName: string;
  projectType: string;
  status: string;
  stages: PublicStage[];
}

const STAGE_LABELS: Record<string, string> = {
  BRIEFING: "Briefing",
  MEDICAO: "Medição",
  ESTUDO_PRELIMINAR: "Estudo Preliminar",
  LAYOUT: "Layout",
  EXECUTIVO: "Executivo",
  ORCAMENTO: "Orçamento",
  OBRA: "Obra",
  ENTREGA: "Entrega",
};

const STATUS_LABELS: Record<string, string> = {
  NAO_INICIADO: "Não iniciado",
  EM_ANDAMENTO: "Em andamento",
  EM_REVISAO: "Em revisão",
  APROVADO: "Concluído",
  ATRASADO: "Em andamento",
};

export default function ClientPortalPage() {
  const params = useParams();
  const token = params.token as string;

  const [data, setData] = useState<PublicProject | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_URL}/public/projects/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Não foi possível encontrar este projeto.");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, [token]);

  if (error) {
    return (
      <main style={{ fontFamily: "sans-serif", padding: "3rem", textAlign: "center" }}>
        <p style={{ color: "#c0392b" }}>{error}</p>
        <p style={{ color: "#999", fontSize: "0.85rem" }}>
          Verifique se o link foi copiado corretamente.
        </p>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ fontFamily: "sans-serif", padding: "3rem", textAlign: "center", color: "#666" }}>
        Carregando...
      </main>
    );
  }

  const completedCount = data.stages.filter((s) => s.status === "APROVADO").length;

  return (
    <main
      style={{
        fontFamily: "sans-serif",
        maxWidth: "560px",
        margin: "0 auto",
        padding: "3rem 1.5rem",
      }}
    >
      <p style={{ fontSize: "0.8rem", color: "#999", margin: 0 }}>Acompanhamento de projeto</p>
      <h1 style={{ fontSize: "1.6rem", margin: "0.25rem 0 1.5rem" }}>{data.projectName}</h1>

      <div
        style={{
          padding: "1rem",
          background: "#f9fafb",
          borderRadius: "8px",
          marginBottom: "2rem",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: "#666" }}>Progresso geral</div>
        <div style={{ fontSize: "1.1rem", fontWeight: "bold", marginTop: "0.2rem" }}>
          {completedCount} de {data.stages.length} etapas concluídas
        </div>
      </div>

      <div>
        {data.stages.map((stage, i) => {
          const isDone = stage.status === "APROVADO";
          const isCurrent = !isDone && data.stages.slice(0, i).every((s) => s.status === "APROVADO");

          return (
            <div
              key={stage.type}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.7rem 0",
                borderBottom: i < data.stages.length - 1 ? "1px solid #f0f0f0" : "none",
              }}
            >
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: isDone ? "#16a34a" : isCurrent ? "#3b82f6" : "#e5e7eb",
                  color: "#fff",
                  fontSize: "0.7rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {isDone ? "✓" : ""}
              </div>
              <div>
                <div style={{ fontWeight: isCurrent ? "bold" : "normal" }}>
                  {STAGE_LABELS[stage.type] ?? stage.type}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#999" }}>
                  {STATUS_LABELS[stage.status] ?? stage.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#bbb", textAlign: "center" }}>
        Página de acompanhamento — ambiente de desenvolvimento
      </p>
    </main>
  );
}
