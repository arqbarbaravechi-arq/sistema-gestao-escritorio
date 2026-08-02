"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Project, PROJECT_TYPE_LABELS } from "@/lib/types";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  ATIVO: { label: "Ativo", color: "#16a34a" },
  PAUSADO: { label: "Pausado", color: "#d97706" },
  CANCELADO: { label: "Cancelado", color: "#dc2626" },
  CONCLUIDO: { label: "Concluído", color: "#6b7280" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<Project[]>("/projects")
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar projetos"));
  }, [router]);

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "720px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Projetos</h1>
          <Link
            href="/projects/new"
            style={{
              background: "#111",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            + Novo projeto
          </Link>
        </div>

        {error && (
          <p style={{ color: "#c0392b", marginTop: "1rem" }}>
            Não foi possível carregar os projetos: {error}
          </p>
        )}

        {!error && projects === null && (
          <p style={{ color: "#666", marginTop: "1rem" }}>Carregando...</p>
        )}

        {!error && projects !== null && projects.length === 0 && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "2rem",
              border: "1px dashed #ccc",
              borderRadius: "8px",
              textAlign: "center",
              color: "#666",
            }}
          >
            <p>Nenhum projeto ativo ainda.</p>
            <Link href="/projects/new" style={{ color: "#111", fontWeight: "bold" }}>
              + Adicionar o primeiro projeto
            </Link>
          </div>
        )}

        {!error && projects !== null && projects.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            {projects.map((project) => {
              const status = STATUS_LABELS[project.status] ?? { label: project.status, color: "#666" };
              return (
                <Link
                  key={project.id}
                  href={`/projects/${project.id}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "1rem",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    marginBottom: "0.75rem",
                    textDecoration: "none",
                    color: "#111",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: "bold" }}>{project.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      {PROJECT_TYPE_LABELS[project.type]}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: status.color,
                      border: `1px solid ${status.color}`,
                      borderRadius: "999px",
                      padding: "0.2rem 0.7rem",
                    }}
                  >
                    {status.label}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
