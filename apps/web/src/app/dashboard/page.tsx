"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Project, PROJECT_TYPE_LABELS, Client } from "@/lib/types";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  ATIVO: { label: "Ativo", color: "#16a34a", bg: "#f0fdf4" },
  PAUSADO: { label: "Pausado", color: "#d97706", bg: "#fffbeb" },
  CANCELADO: { label: "Cancelado", color: "#dc2626", bg: "#fef2f2" },
  CONCLUIDO: { label: "Concluído", color: "#6b7280", bg: "#f9fafb" },
};

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }

    apiFetch<Project[]>("/projects")
      .then(setProjects)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar projetos"));

    apiFetch<Client[]>("/clients")
      .then(setClients)
      .catch(() => {});
  }, [router]);

  function clientName(clientId: string) {
    return clients.find((c) => c.id === clientId)?.name ?? null;
  }

  const filtered = (projects ?? []).filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      (clientName(p.clientId)?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <AppShell>
      <div style={{ padding: "2rem 2.5rem", maxWidth: "900px" }}>
        <div style={{ position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-muted)",
            }}
          >
            🔍
          </span>
          <input
            className="sga-search"
            placeholder="Buscar projeto ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: "#c0392b", marginTop: "1.5rem" }}>
            Não foi possível carregar os projetos: {error}
          </p>
        )}

        {!error && projects === null && (
          <p style={{ color: "var(--color-text-secondary)", marginTop: "1.5rem" }}>Carregando...</p>
        )}

        {!error && projects !== null && projects.length === 0 && (
          <div
            className="sga-card"
            style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--color-text-secondary)" }}
          >
            <p>Nenhum projeto ainda.</p>
            <Link href="/projects/new" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
              + Criar o primeiro projeto
            </Link>
          </div>
        )}

        {!error && projects !== null && projects.length > 0 && (
          <div style={{ marginTop: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "var(--color-text-secondary)",
                padding: "0 0.5rem 0.5rem",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <span style={{ flex: "0 0 32px" }}></span>
              <span style={{ flex: 2 }}>Nome</span>
              <span style={{ flex: 1 }}>Cliente</span>
              <span style={{ flex: 1 }}>Tipo</span>
              <span style={{ flex: "0 0 100px" }}>Status</span>
            </div>

            {filtered.map((project) => {
              const status = STATUS_LABELS[project.status] ?? {
                label: project.status,
                color: "#666",
                bg: "#f5f5f5",
              };
              return (
                <Link key={project.id} href={`/projects/${project.id}`} className="sga-row">
                  <span style={{ flex: "0 0 32px", fontSize: "1.1rem" }}>🏠</span>
                  <span style={{ flex: 2, fontWeight: 600 }}>{project.name}</span>
                  <span style={{ flex: 1, color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                    {clientName(project.clientId) ?? "—"}
                  </span>
                  <span style={{ flex: 1, color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                    {PROJECT_TYPE_LABELS[project.type]}
                  </span>
                  <span style={{ flex: "0 0 100px" }}>
                    <span
                      className="sga-badge"
                      style={{ color: status.color, background: status.bg }}
                    >
                      {status.label}
                    </span>
                  </span>
                </Link>
              );
            })}

            {filtered.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", padding: "1rem 0.5rem" }}>
                Nenhum projeto encontrado para &quot;{search}&quot;.
              </p>
            )}
          </div>
        )}
      </div>

      <Link href="/projects/new" className="sga-fab" title="Novo projeto">
        +
      </Link>
    </AppShell>
  );
}
