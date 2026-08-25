"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Client } from "@/lib/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    apiFetch<Client[]>("/clients")
      .then(setClients)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, []);

  const filtered = (clients ?? []).filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false) ||
      (c.phone?.toLowerCase().includes(q) ?? false)
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
            placeholder="Buscar cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {error && <p style={{ color: "#c0392b", marginTop: "1.5rem" }}>{error}</p>}

        {!error && clients === null && (
          <p style={{ color: "var(--color-text-secondary)", marginTop: "1.5rem" }}>Carregando...</p>
        )}

        {!error && clients !== null && clients.length === 0 && (
          <div
            className="sga-card"
            style={{ marginTop: "1.5rem", textAlign: "center", color: "var(--color-text-secondary)" }}
          >
            <p>Nenhum cliente cadastrado ainda.</p>
            <Link href="/clients/new" style={{ color: "var(--color-primary)", fontWeight: 700 }}>
              + Cadastrar o primeiro cliente
            </Link>
          </div>
        )}

        {!error && clients !== null && clients.length > 0 && (
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
              <span style={{ flex: 2 }}>E-mail</span>
              <span style={{ flex: 1 }}>Telefone</span>
            </div>

            {filtered.map((c) => (
              <div key={c.id} className="sga-row">
                <span style={{ flex: "0 0 32px", fontSize: "1.1rem" }}>👤</span>
                <span style={{ flex: 2, fontWeight: 600 }}>{c.name}</span>
                <span style={{ flex: 2, color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                  {c.email ?? "—"}
                </span>
                <span style={{ flex: 1, color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                  {c.phone ?? "—"}
                </span>
              </div>
            ))}

            {filtered.length === 0 && (
              <p style={{ color: "var(--color-text-secondary)", padding: "1rem 0.5rem" }}>
                Nenhum cliente encontrado para &quot;{search}&quot;.
              </p>
            )}
          </div>
        )}
      </div>

      <Link href="/clients/new" className="sga-fab" title="Novo cliente">
        +
      </Link>
    </AppShell>
  );
}
