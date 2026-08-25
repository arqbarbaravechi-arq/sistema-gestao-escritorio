"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Project } from "@/lib/types";

interface Template {
  id: string;
  name: string;
  description: string;
}

export default function BibliotecaPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [rendered, setRendered] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    apiFetch<Template[]>("/document-templates")
      .then(setTemplates)
      .catch(() => {});
    apiFetch<Project[]>("/projects")
      .then(setProjects)
      .catch(() => {});
  }, []);

  async function generate() {
    if (!templateId || !projectId) return;
    setError(null);
    setCopied(false);
    try {
      const result = await apiFetch<{ content: string }>(
        `/document-templates/${templateId}/render?projectId=${projectId}`,
      );
      setRendered(result.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar documento");
    }
  }

  function copy() {
    if (!rendered) return;
    navigator.clipboard.writeText(rendered);
    setCopied(true);
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem 2.5rem", maxWidth: "720px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Biblioteca</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.4rem", fontSize: "0.85rem" }}>
          Modelos de documento preenchidos automaticamente com os dados do projeto e do cliente —
          copie e use onde precisar (Word, e-mail).
        </p>

        <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="sga-input"
            style={{ flex: "1 1 220px" }}
          >
            <option value="">Selecione um modelo</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>

          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="sga-input"
            style={{ flex: "1 1 220px" }}
          >
            <option value="">Selecione um projeto</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={generate}
            disabled={!templateId || !projectId}
            className="sga-btn sga-btn-primary"
          >
            Gerar
          </button>
        </div>

        {error && <p style={{ color: "#c0392b", marginTop: "1rem" }}>{error}</p>}

        {rendered && (
          <div style={{ marginTop: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "0.5rem" }}>
              <button onClick={copy} className="sga-btn sga-btn-secondary sga-btn-sm">
                {copied ? "✅ Copiado!" : "Copiar texto"}
              </button>
            </div>
            <pre
              className="sga-card"
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "0.85rem",
                fontFamily: "inherit",
                background: "var(--color-bg-subtle)",
              }}
            >
              {rendered}
            </pre>
          </div>
        )}
      </div>
    </AppShell>
  );
}
