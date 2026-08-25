"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";

interface PaymentRequest {
  id: string;
  description: string;
  value: number;
  status: "PENDENTE" | "PAGO" | "CANCELADO";
}

interface FinancialSummary {
  totalPending: number;
  totalPaidThisMonth: number;
  totalOverdue: number;
  requests: PaymentRequest[];
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FinanceiroPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<FinancialSummary>("/financial-summary")
      .then(setSummary)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, []);

  return (
    <AppShell>
      <div style={{ padding: "2rem 2.5rem", maxWidth: "720px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Financeiro</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.4rem", fontSize: "0.85rem" }}>
          Visão somente-leitura, espelhando as cobranças registradas em cada projeto.
        </p>

        {error && <p style={{ color: "#c0392b", marginTop: "1rem" }}>{error}</p>}

        {summary && (
          <>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap" }}>
              <div className="sga-card" style={{ flex: "1 1 160px" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  A receber
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>
                  {formatCurrency(summary.totalPending)}
                </div>
              </div>
              <div
                className="sga-card"
                style={{ flex: "1 1 160px", background: "#f0fdf4", borderColor: "#bbf7d0" }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  Recebido no mês
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-success)" }}>
                  {formatCurrency(summary.totalPaidThisMonth)}
                </div>
              </div>
              <div
                className="sga-card"
                style={{ flex: "1 1 160px", background: "#fef2f2", borderColor: "#fecaca" }}
              >
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                  Em atraso
                </div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--color-danger)" }}>
                  {formatCurrency(summary.totalOverdue)}
                </div>
              </div>
            </div>

            <h2 style={{ fontSize: "1rem", marginTop: "2rem" }}>Todas as cobranças</h2>
            {summary.requests.length === 0 ? (
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.85rem" }}>
                Nenhuma cobrança registrada ainda.
              </p>
            ) : (
              <div style={{ marginTop: "0.5rem" }}>
                {summary.requests.map((r) => {
                  const statusColor =
                    r.status === "PAGO"
                      ? "var(--color-success)"
                      : r.status === "CANCELADO"
                        ? "var(--color-text-muted)"
                        : "var(--color-warning)";
                  return (
                    <div key={r.id} className="sga-row">
                      <span style={{ flex: 1, fontWeight: 600 }}>{r.description}</span>
                      <span style={{ fontSize: "0.85rem" }}>{formatCurrency(r.value)}</span>
                      <span
                        className="sga-badge"
                        style={{ color: statusColor, background: "var(--color-bg-subtle)" }}
                      >
                        {r.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
