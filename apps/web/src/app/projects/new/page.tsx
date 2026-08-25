"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Project, ProjectType, PROJECT_TYPE_LABELS, Client } from "@/lib/types";

const TYPES: ProjectType[] = ["INTERIORES", "ARQUITETONICO", "COMERCIAL", "CONSULTORIA"];

interface Template {
  id: string;
  name: string;
  description: string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<ProjectType>("INTERIORES");
  const [templateId, setTemplateId] = useState<string>("");
  const [clientId, setClientId] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [clients, setClients] = useState<Client[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Template[]>("/templates")
      .then(setTemplates)
      .catch(() => {
        // Falha ao carregar templates não deve travar a criação de
        // projeto — segue sem opção de template, degradação graciosa.
      });

    apiFetch<Client[]>("/clients")
      .then(setClients)
      .catch(() => setClients([]));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await apiFetch<{ project: Project }>("/projects", {
        method: "POST",
        body: JSON.stringify({ name, type, clientId, templateId: templateId || undefined }),
      });
      router.push(`/projects/${result.project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar projeto");
    } finally {
      setLoading(false);
    }
  }

  const selectedTemplate = templates.find((t) => t.id === templateId);

  // Ainda carregando a lista de clientes — evita "piscar" a mensagem de
  // vazio antes da resposta da API chegar.
  if (clients === null) {
    return (
      <main style={{ fontFamily: "sans-serif", maxWidth: "480px", margin: "3rem auto", padding: "0 1.5rem" }}>
        <p style={{ color: "var(--color-text-secondary)" }}>Carregando...</p>
      </main>
    );
  }

  // Sem nenhum cliente cadastrado ainda — não deixa nem tentar criar
  // projeto, direciona direto para o cadastro de cliente primeiro.
  if (clients.length === 0) {
    return (
      <main style={{ fontFamily: "sans-serif", maxWidth: "480px", margin: "3rem auto", padding: "0 1.5rem" }}>
        <Link href="/dashboard" style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
          ← Voltar
        </Link>
        <h1 style={{ fontSize: "1.25rem", marginTop: "1rem" }}>Novo projeto</h1>
        <div
          style={{
            marginTop: "1.5rem",
            padding: "1.5rem",
            border: "1px dashed #ccc",
            borderRadius: "12px",
            color: "var(--color-text-secondary)",
          }}
        >
          <p style={{ margin: 0 }}>
            Antes de criar um projeto, você precisa cadastrar o cliente dele.
          </p>
          <Link
            href="/clients/new"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              background: "#111111",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            + Cadastrar cliente agora
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: "480px", margin: "3rem auto", padding: "0 1.5rem" }}>
      <Link href="/dashboard" style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
        ← Voltar
      </Link>
      <h1 style={{ fontSize: "1.25rem", marginTop: "1rem" }}>Novo projeto</h1>
      <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        As 8 etapas padrão (Briefing até Entrega) são criadas automaticamente.
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: "0.75rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Cliente
          </span>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            required
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="" disabled>
              Selecione o cliente
            </option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Link href="/clients/new" style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}>
            + Cadastrar um novo cliente
          </Link>
        </label>

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

        <label style={{ display: "block", marginBottom: "0.75rem" }}>
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

        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          <span style={{ display: "block", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
            Template (opcional)
          </span>
          <select
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            style={{ width: "100%", padding: "0.5rem" }}
          >
            <option value="">Nenhum — definir prazos manualmente depois</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>

        {selectedTemplate && (
          <p style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)", marginBottom: "1.5rem", marginTop: "0.3rem" }}>
            {selectedTemplate.description}
          </p>
        )}
        {!selectedTemplate && <div style={{ marginBottom: "1.5rem" }} />}

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
          {loading ? "Criando..." : "Criar projeto"}
        </button>
      </form>
    </main>
  );
}
