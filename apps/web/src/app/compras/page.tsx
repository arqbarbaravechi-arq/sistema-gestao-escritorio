"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";

interface Supplier {
  id: string;
  name: string;
  category: string;
  contact: string | null;
}

const CATEGORIES = ["MARCENARIA", "MARMORARIA", "OBRA_CIVIL", "OUTRO"];
const CATEGORY_LABELS: Record<string, string> = {
  MARCENARIA: "Marcenaria",
  MARMORARIA: "Marmoraria",
  OBRA_CIVIL: "Obra civil",
  OUTRO: "Outro",
};

export default function ComprasPage() {
  const [suppliers, setSuppliers] = useState<Supplier[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("MARCENARIA");
  const [contact, setContact] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    apiFetch<Supplier[]>("/suppliers")
      .then(setSuppliers)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAddSupplier(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch("/suppliers", {
        method: "POST",
        body: JSON.stringify({ name, category, contact: contact || undefined }),
      });
      setName("");
      setContact("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao cadastrar fornecedor");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "640px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Gestão de Compras</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.5rem", fontSize: "0.85rem" }}>
          Cadastre fornecedores aqui. Para registrar e comparar cotações de um projeto
          específico, abra o projeto em &quot;Projetos&quot; — lá aparece a seção de cotações.
        </p>

        <div
          style={{
            marginTop: "1.5rem",
            padding: "1rem",
            border: "1px solid var(--color-border)",
            borderRadius: "12px",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "0.9rem", marginBottom: "0.75rem" }}>
            + Novo fornecedor
          </div>
          <form onSubmit={handleAddSupplier} style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Nome do fornecedor"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{ flex: "1 1 200px", padding: "0.45rem" }}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: "0.45rem" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Contato (opcional)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              style={{ flex: "1 1 150px", padding: "0.45rem" }}
            />
            <button
              type="submit"
              disabled={saving}
              style={{
                background: "#111111",
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "0.45rem 1rem",
                cursor: "pointer",
              }}
            >
              {saving ? "Salvando..." : "Cadastrar"}
            </button>
          </form>
        </div>

        {error && <p style={{ color: "var(--color-danger)", marginTop: "1rem" }}>{error}</p>}

        <div style={{ marginTop: "1.5rem" }}>
          {suppliers === null && !error && <p style={{ color: "var(--color-text-secondary)" }}>Carregando...</p>}

          {suppliers !== null && suppliers.length === 0 && (
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>Nenhum fornecedor cadastrado ainda.</p>
          )}

          {suppliers?.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "0.7rem 1rem",
                border: "1px solid var(--color-border)",
                borderRadius: "12px",
                marginBottom: "0.5rem",
              }}
            >
              <span>{s.name}</span>
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                {CATEGORY_LABELS[s.category] ?? s.category}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
