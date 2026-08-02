"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";

interface Template {
  id: string;
  name: string;
  description: string;
  stageDurations: Record<string, number>;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Template[]>("/templates")
      .then(setTemplates)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, []);

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Templates de Projeto</h1>
        <p style={{ color: "#666", marginTop: "0.5rem" }}>
          Modelos prontos com prazo automático por etapa — escolha um ao criar um projeto novo,
          na tela &quot;+ Novo projeto&quot;.
        </p>

        {error && <p style={{ color: "#c0392b", marginTop: "1rem" }}>{error}</p>}

        {!error && templates === null && (
          <p style={{ color: "#666", marginTop: "1rem" }}>Carregando...</p>
        )}

        {!error &&
          templates?.map((t) => (
            <div
              key={t.id}
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "1px solid #e5e5e5",
                borderRadius: "8px",
              }}
            >
              <div style={{ fontWeight: "bold" }}>{t.name}</div>
              <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.2rem" }}>
                {t.description}
              </div>
            </div>
          ))}

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px dashed #ccc",
            borderRadius: "8px",
            color: "#666",
            fontSize: "0.85rem",
          }}
        >
          🚧 Versão inicial: 3 templates fixos, prazos definidos com base no que já foi relatado
          sobre o funcionamento do escritório. Criar/editar templates próprios ainda não foi
          construído.
        </div>
      </div>
    </AppShell>
  );
}
