"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { apiFetch, ApiError } from "@/lib/api";

interface Lead {
  id: string;
  name: string;
  contact: string | null;
  origin: string;
  projectType: string | null;
  budgetRange: string | null;
  status: string;
  lossReason: string | null;
  nextFollowUpAt: string | null;
  clientId: string | null;
}

const ORIGIN_LABELS: Record<string, string> = {
  INSTAGRAM_ORGANICO: "Instagram (orgânico)",
  INSTAGRAM_PAGO: "Instagram (pago)",
  INDICACAO: "Indicação",
  OUTRO: "Outro",
};

const COLUMNS: { status: string; label: string }[] = [
  { status: "NOVO", label: "Novo" },
  { status: "QUALIFICADO", label: "Qualificado" },
  { status: "REUNIAO_MARCADA", label: "Reunião marcada" },
  { status: "AGUARDANDO_DECISAO", label: "Aguardando decisão" },
  { status: "FECHADO", label: "Fechado" },
  { status: "PERDIDO", label: "Perdido" },
];

export default function CrmPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    apiFetch<Lead[]>("/leads")
      .then(setLeads)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }

  useEffect(() => {
    load();
  }, []);

  async function moveStatus(leadId: string, status: string) {
    setBusy(true);
    try {
      await apiFetch(`/leads/${leadId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao mover lead");
    } finally {
      setBusy(false);
    }
  }

  async function markAsLost(leadId: string) {
    const reason = prompt("Motivo da perda:");
    if (!reason) return;
    setBusy(true);
    try {
      await apiFetch(`/leads/${leadId}/lost`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao marcar como perdido");
    } finally {
      setBusy(false);
    }
  }

  async function reopen(leadId: string) {
    setBusy(true);
    try {
      await apiFetch(`/leads/${leadId}/reopen`, { method: "PATCH" });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao reabrir lead");
    } finally {
      setBusy(false);
    }
  }

  async function convertToClient(leadId: string) {
    setBusy(true);
    try {
      await apiFetch(`/leads/${leadId}/convert-to-client`, { method: "POST" });
      load();
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError("Erro ao converter em cliente");
    } finally {
      setBusy(false);
    }
  }

  if (!leads && !error) {
    return (
      <AppShell>
        <p style={{ padding: "2rem", color: "var(--color-text-secondary)" }}>Carregando...</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: "1.3rem", margin: 0 }}>CRM de Vendas</h1>
          <Link
            href="/crm/new"
            style={{
              background: "#111111",
              color: "#fff",
              padding: "0.5rem 1rem",
              borderRadius: "999px",
              textDecoration: "none",
              fontSize: "0.9rem",
            }}
          >
            + Novo lead
          </Link>
        </div>

        {error && <p style={{ color: "var(--color-danger)", marginTop: "1rem" }}>{error}</p>}

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "1.5rem",
            overflowX: "auto",
            paddingBottom: "1rem",
          }}
        >
          {COLUMNS.map((col) => {
            const columnLeads = leads?.filter((l) => l.status === col.status) ?? [];
            return (
              <div key={col.status} style={{ minWidth: "230px", flexShrink: 0 }}>
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "var(--color-text-secondary)",
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                  }}
                >
                  {col.label} ({columnLeads.length})
                </div>

                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      background: "#fff",
                      border: "1px solid var(--color-border)",
                      borderRadius: "12px",
                      padding: "0.75rem",
                      marginBottom: "0.5rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{lead.name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.15rem" }}>
                      {ORIGIN_LABELS[lead.origin] ?? lead.origin}
                      {lead.projectType && ` · ${lead.projectType}`}
                    </div>
                    {lead.budgetRange && (
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{lead.budgetRange}</div>
                    )}
                    {lead.lossReason && (
                      <div style={{ fontSize: "0.75rem", color: "var(--color-danger)", marginTop: "0.3rem" }}>
                        Motivo: {lead.lossReason}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "0.3rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                      {col.status === "NOVO" && (
                        <button disabled={busy} onClick={() => moveStatus(lead.id, "QUALIFICADO")} style={miniButton}>
                          Qualificar
                        </button>
                      )}
                      {col.status === "QUALIFICADO" && (
                        <button disabled={busy} onClick={() => moveStatus(lead.id, "REUNIAO_MARCADA")} style={miniButton}>
                          Marcar reunião
                        </button>
                      )}
                      {col.status === "REUNIAO_MARCADA" && (
                        <button disabled={busy} onClick={() => moveStatus(lead.id, "AGUARDANDO_DECISAO")} style={miniButton}>
                          Aguardar decisão
                        </button>
                      )}
                      {col.status === "AGUARDANDO_DECISAO" && (
                        <button disabled={busy} onClick={() => convertToClient(lead.id)} style={miniButtonPrimary}>
                          Fechar (virar cliente)
                        </button>
                      )}
                      {col.status !== "FECHADO" && col.status !== "PERDIDO" && (
                        <button disabled={busy} onClick={() => markAsLost(lead.id)} style={miniButtonDanger}>
                          Perdido
                        </button>
                      )}
                      {col.status === "PERDIDO" && (
                        <button disabled={busy} onClick={() => reopen(lead.id)} style={miniButton}>
                          🔄 Reabrir
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {columnLeads.length === 0 && (
                  <div style={{ fontSize: "0.78rem", color: "#ccc", padding: "0.5rem 0" }}>—</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

const miniButton: React.CSSProperties = {
  fontSize: "0.72rem",
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: "999px",
  padding: "0.25rem 0.5rem",
  cursor: "pointer",
};

const miniButtonPrimary: React.CSSProperties = {
  ...miniButton,
  background: "#111111",
  color: "#fff",
  border: "none",
};

const miniButtonDanger: React.CSSProperties = {
  ...miniButton,
  color: "var(--color-danger)",
  borderColor: "#dc2626",
};
