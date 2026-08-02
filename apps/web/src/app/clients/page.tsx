"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";
import { Client } from "@/lib/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Client[]>("/clients")
      .then(setClients)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, []);

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "600px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Clientes</h1>
          <Link
            href="/clients/new"
            style={{
              background: "#111",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            + Novo cliente
          </Link>
        </div>
        <p style={{ color: "#666", marginTop: "0.5rem", fontSize: "0.85rem" }}>
          Todo projeto precisa estar vinculado a um cliente já cadastrado aqui.
        </p>

        {error && <p style={{ color: "#c0392b", marginTop: "1rem" }}>{error}</p>}

        {!error && clients === null && (
          <p style={{ color: "#666", marginTop: "1rem" }}>Carregando...</p>
        )}

        {!error && clients !== null && clients.length === 0 && (
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
            <p>Nenhum cliente cadastrado ainda.</p>
            <Link href="/clients/new" style={{ color: "#111", fontWeight: "bold" }}>
              + Cadastrar o primeiro cliente
            </Link>
          </div>
        )}

        {!error && clients !== null && clients.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            {clients.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: "0.9rem 1rem",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  marginBottom: "0.5rem",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{c.name}</div>
                <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.2rem" }}>
                  {c.email && <span>{c.email}</span>}
                  {c.email && c.phone && <span> · </span>}
                  {c.phone && <span>{c.phone}</span>}
                  {!c.email && !c.phone && <span>Sem contato cadastrado</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
