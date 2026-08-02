"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { apiFetch, ApiError } from "@/lib/api";
import { ProjectDetail, STAGE_LABELS, StageStatus, Client } from "@/lib/types";

interface PaymentRequest {
  id: string;
  description: string;
  value: number;
  status: "PENDENTE" | "PAGO" | "CANCELADO";
  dueDate: string | null;
  paidAt: string | null;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
}

interface Quote {
  id: string;
  supplierId: string;
  category: string;
  value: number;
  status: "PENDENTE" | "APROVADA" | "RECUSADA";
}

const CATEGORY_LABELS: Record<string, string> = {
  MARCENARIA: "Marcenaria",
  MARMORARIA: "Marmoraria",
  OBRA_CIVIL: "Obra civil",
  OUTRO: "Outro",
};

const STAGE_STATUS_COLOR: Record<StageStatus, string> = {
  NAO_INICIADO: "#d1d5db",
  EM_ANDAMENTO: "#3b82f6",
  EM_REVISAO: "#f59e0b",
  APROVADO: "#16a34a",
  ATRASADO: "#dc2626",
};

const STAGE_STATUS_LABEL: Record<StageStatus, string> = {
  NAO_INICIADO: "Não iniciado",
  EM_ANDAMENTO: "Em andamento",
  EM_REVISAO: "Em revisão",
  APROVADO: "Aprovado",
  ATRASADO: "Atrasado",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [data, setData] = useState<ProjectDetail | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quoteSupplierId, setQuoteSupplierId] = useState("");
  const [quoteValue, setQuoteValue] = useState("");
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [paymentDescription, setPaymentDescription] = useState("");
  const [paymentValue, setPaymentValue] = useState("");

  const load = useCallback(async () => {
    try {
      const result = await apiFetch<ProjectDetail>(`/projects/${projectId}`);
      setData(result);
      apiFetch<Client>(`/clients/${result.project.clientId}`)
        .then(setClient)
        .catch(() => {
          // Falha ao buscar o cliente não deve travar a exibição do
          // projeto — degradação graciosa, mesma lógica já usada com
          // templates na tela de criação de projeto.
        });
      apiFetch<Supplier[]>("/suppliers")
        .then(setSuppliers)
        .catch(() => {});
      apiFetch<Quote[]>(`/projects/${projectId}/quotes`)
        .then(setQuotes)
        .catch(() => {});
      apiFetch<PaymentRequest[]>(`/projects/${projectId}/payment-requests`)
        .then(setPaymentRequests)
        .catch(() => {});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar projeto");
    }
  }, [projectId]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      router.push("/login");
      return;
    }
    load();
  }, [load, router]);

  async function updateStageStatus(stageId: string, status: StageStatus) {
    setBusy(true);
    setActionMessage(null);
    try {
      await apiFetch(`/projects/${projectId}/stages/${stageId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await load();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Erro ao atualizar etapa");
    } finally {
      setBusy(false);
    }
  }

  async function addRevisionRound() {
    setBusy(true);
    setActionMessage(null);
    try {
      await apiFetch(`/projects/${projectId}/revision-rounds`, {
        method: "POST",
        body: JSON.stringify({ description: "Rodada registrada pela interface" }),
      });
      setActionMessage("Rodada de revisão registrada.");
      await load();
    } catch (err) {
      if (err instanceof ApiError && err.code === "REVISION_ROUNDS_EXHAUSTED") {
        setActionMessage(
          "⚠️ " + err.message,
        );
      } else {
        setActionMessage(err instanceof Error ? err.message : "Erro ao registrar rodada");
      }
    } finally {
      setBusy(false);
    }
  }

  async function addQuote(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setActionMessage(null);
    try {
      await apiFetch(`/projects/${projectId}/quotes`, {
        method: "POST",
        body: JSON.stringify({ supplierId: quoteSupplierId, value: Number(quoteValue) }),
      });
      setQuoteSupplierId("");
      setQuoteValue("");
      const updated = await apiFetch<Quote[]>(`/projects/${projectId}/quotes`);
      setQuotes(updated);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Erro ao registrar cotação");
    } finally {
      setBusy(false);
    }
  }

  async function approveQuote(quoteId: string) {
    setBusy(true);
    setActionMessage(null);
    try {
      await apiFetch(`/projects/${projectId}/quotes/${quoteId}/approve`, { method: "PATCH" });
      const updated = await apiFetch<Quote[]>(`/projects/${projectId}/quotes`);
      setQuotes(updated);
      setActionMessage("✅ Cotação aprovada — as demais da mesma categoria foram recusadas automaticamente.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Erro ao aprovar cotação");
    } finally {
      setBusy(false);
    }
  }

  async function createBudgetAmendment() {
    setBusy(true);
    setActionMessage(null);
    try {
      await apiFetch(`/projects/${projectId}/budget-amendments`, {
        method: "POST",
        body: JSON.stringify({ reason: "Alteração além das 2 rodadas incluídas no contrato" }),
      });
      setActionMessage("✅ Novo orçamento (aditivo) registrado.");
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Erro ao criar aditivo");
    } finally {
      setBusy(false);
    }
  }

  async function addPaymentRequest(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setActionMessage(null);
    try {
      await apiFetch(`/projects/${projectId}/payment-requests`, {
        method: "POST",
        body: JSON.stringify({ description: paymentDescription, value: Number(paymentValue) }),
      });
      setPaymentDescription("");
      setPaymentValue("");
      const updated = await apiFetch<PaymentRequest[]>(`/projects/${projectId}/payment-requests`);
      setPaymentRequests(updated);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Erro ao criar cobrança");
    } finally {
      setBusy(false);
    }
  }

  async function markPaymentAsPaid(requestId: string) {
    setBusy(true);
    setActionMessage(null);
    try {
      await apiFetch(`/projects/${projectId}/payment-requests/${requestId}/mark-paid`, {
        method: "PATCH",
      });
      const updated = await apiFetch<PaymentRequest[]>(`/projects/${projectId}/payment-requests`);
      setPaymentRequests(updated);
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Erro ao marcar como paga");
    } finally {
      setBusy(false);
    }
  }

  async function pauseOrCancel(action: "pause" | "cancel") {
    const reason = prompt(
      action === "pause" ? "Motivo da pausa:" : "Motivo do cancelamento:",
    );
    if (!reason) return;

    setBusy(true);
    try {
      await apiFetch(`/projects/${projectId}/${action}`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      });
      await load();
    } catch (err) {
      setActionMessage(err instanceof Error ? err.message : "Erro ao atualizar projeto");
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <AppShell>
        <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "720px" }}>
          <p style={{ color: "#c0392b" }}>{error}</p>
          <Link href="/dashboard">← Voltar</Link>
        </main>
      </AppShell>
    );
  }

  if (!data) {
    return (
      <AppShell>
        <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
          <p style={{ color: "#666" }}>Carregando...</p>
        </main>
      </AppShell>
    );
  }

  const { project, stages, revisionRoundsUsed, revisionRoundsAvailable } = data;

  return (
    <AppShell>
    <main style={{ fontFamily: "sans-serif", padding: "2rem", maxWidth: "720px", margin: "0 auto" }}>
      <Link href="/dashboard" style={{ color: "#666", fontSize: "0.85rem" }}>
        ← Projetos
      </Link>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "0.5rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", margin: 0 }}>{project.name}</h1>
          {client && (
            <p style={{ color: "#333", fontSize: "0.85rem", margin: "0.2rem 0 0" }}>
              Cliente: <strong>{client.name}</strong>
            </p>
          )}
          <p style={{ color: "#666", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
            Status: <strong>{project.status}</strong>
            {project.statusReason && ` — ${project.statusReason}`}
          </p>
        </div>
        {project.status === "ATIVO" && (
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => pauseOrCancel("pause")} disabled={busy} style={buttonSecondary}>
              Pausar
            </button>
            <button onClick={() => pauseOrCancel("cancel")} disabled={busy} style={buttonDanger}>
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Portal do Cliente — link compartilhável (CR-001, item 1) */}
      <div
        style={{
          marginTop: "1rem",
          padding: "1rem",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>Link para o cliente acompanhar</div>
          <div style={{ fontSize: "0.8rem", color: "#999", marginTop: "0.15rem" }}>
            Sem necessidade de login — qualquer pessoa com o link consegue ver o progresso
          </div>
        </div>
        <button
          onClick={() => {
            const url = `${window.location.origin}/portal/${project.clientAccessToken}`;
            navigator.clipboard.writeText(url);
            setActionMessage("✅ Link copiado para a área de transferência.");
          }}
          style={buttonSecondary}
        >
          Copiar link
        </button>
      </div>

      {/* Contador de rodadas de revisão — CR-000 */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "0.85rem", color: "#666" }}>Rodadas de revisão (por projeto)</div>
          <div style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
            {"●".repeat(revisionRoundsUsed)}
            {"○".repeat(revisionRoundsAvailable)}
            {"  "}
            <span style={{ fontWeight: "normal", fontSize: "0.85rem", color: "#666" }}>
              {revisionRoundsUsed} de {revisionRoundsUsed + revisionRoundsAvailable} usadas
            </span>
          </div>
        </div>
        {revisionRoundsAvailable > 0 ? (
          <button onClick={addRevisionRound} disabled={busy} style={buttonSecondary}>
            + Registrar rodada
          </button>
        ) : (
          <button onClick={createBudgetAmendment} disabled={busy} style={buttonPrimary}>
            Gerar novo orçamento
          </button>
        )}
      </div>

      {actionMessage && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#374151" }}>{actionMessage}</p>
      )}

      {/* Gestão de Compras — cotações (CR-001, item 3) */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.5rem" }}>
          Cotações de fornecedores
        </div>

        {suppliers.length === 0 ? (
          <p style={{ fontSize: "0.8rem", color: "#999" }}>
            Nenhum fornecedor cadastrado ainda — cadastre em &quot;Gestão de Compras&quot; no menu.
          </p>
        ) : (
          <form onSubmit={addQuote} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
            <select
              value={quoteSupplierId}
              onChange={(e) => setQuoteSupplierId(e.target.value)}
              required
              style={{ flex: "1 1 160px", padding: "0.4rem" }}
            >
              <option value="" disabled>
                Fornecedor
              </option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({CATEGORY_LABELS[s.category] ?? s.category})
                </option>
              ))}
            </select>
            <input
              type="number"
              placeholder="Valor (R$)"
              value={quoteValue}
              onChange={(e) => setQuoteValue(e.target.value)}
              required
              min="0.01"
              step="0.01"
              style={{ width: "140px", padding: "0.4rem" }}
            />
            <button type="submit" disabled={busy} style={buttonSecondary}>
              + Registrar cotação
            </button>
          </form>
        )}

        {quotes.length > 0 && (
          <div>
            {quotes.map((q) => {
              const supplier = suppliers.find((s) => s.id === q.supplierId);
              const statusColor =
                q.status === "APROVADA" ? "#16a34a" : q.status === "RECUSADA" ? "#dc2626" : "#666";
              return (
                <div
                  key={q.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0",
                    borderTop: "1px solid #f0f0f0",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>
                    {supplier?.name ?? "Fornecedor"} —{" "}
                    <strong>
                      R$ {q.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </strong>
                    <span style={{ color: statusColor, marginLeft: "0.5rem" }}>({q.status})</span>
                  </span>
                  {q.status === "PENDENTE" && (
                    <button onClick={() => approveQuote(q.id)} disabled={busy} style={buttonSecondary}>
                      Aprovar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cobranças (CR-001, item 7 - base de Pagamento Integrado) */}
      <div
        style={{
          marginTop: "1.5rem",
          padding: "1rem",
          border: "1px solid #e5e5e5",
          borderRadius: "8px",
        }}
      >
        <div style={{ fontSize: "0.85rem", color: "#666", marginBottom: "0.25rem" }}>
          Cobranças
        </div>
        <p style={{ fontSize: "0.72rem", color: "#999", marginBottom: "0.5rem" }}>
          Controle manual — marque como paga quando o dinheiro chegar (Pix, transferência).
          Não processa pagamento online.
        </p>

        <form onSubmit={addPaymentRequest} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
          <input
            type="text"
            placeholder="Descrição (ex: Parcela 1/4)"
            value={paymentDescription}
            onChange={(e) => setPaymentDescription(e.target.value)}
            required
            style={{ flex: "1 1 180px", padding: "0.4rem" }}
          />
          <input
            type="number"
            placeholder="Valor (R$)"
            value={paymentValue}
            onChange={(e) => setPaymentValue(e.target.value)}
            required
            min="0.01"
            step="0.01"
            style={{ width: "140px", padding: "0.4rem" }}
          />
          <button type="submit" disabled={busy} style={buttonSecondary}>
            + Nova cobrança
          </button>
        </form>

        {paymentRequests.length > 0 && (
          <div>
            {paymentRequests.map((r) => {
              const statusColor =
                r.status === "PAGO" ? "#16a34a" : r.status === "CANCELADO" ? "#999" : "#d97706";
              return (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0",
                    borderTop: "1px solid #f0f0f0",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>
                    {r.description} —{" "}
                    <strong>R$ {r.value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    <span style={{ color: statusColor, marginLeft: "0.5rem" }}>({r.status})</span>
                  </span>
                  {r.status === "PENDENTE" && (
                    <button onClick={() => markPaymentAsPaid(r.id)} disabled={busy} style={buttonSecondary}>
                      Marcar como paga
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Etapas */}
      <h2 style={{ fontSize: "1rem", marginTop: "2rem" }}>Etapas</h2>
      <div style={{ marginTop: "0.5rem" }}>
        {stages.map((stage) => (
          <div
            key={stage.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              marginBottom: "0.5rem",
            }}
          >
            <div>
              <div style={{ fontWeight: "bold" }}>
                {STAGE_LABELS[stage.type] ?? stage.type}
                {stage.mode === "CICLO_ABERTO" && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.7rem",
                      color: "#7c3aed",
                      border: "1px solid #7c3aed",
                      borderRadius: "999px",
                      padding: "0.1rem 0.5rem",
                    }}
                  >
                    modo exceção
                  </span>
                )}
                {stage.late && (
                  <span
                    style={{
                      marginLeft: "0.5rem",
                      fontSize: "0.7rem",
                      color: "#dc2626",
                      border: "1px solid #dc2626",
                      borderRadius: "999px",
                      padding: "0.1rem 0.5rem",
                    }}
                  >
                    atrasado
                  </span>
                )}
              </div>
              <div style={{ fontSize: "0.8rem", color: STAGE_STATUS_COLOR[stage.status] }}>
                {STAGE_STATUS_LABEL[stage.status]}
                {stage.dueDate && (
                  <span style={{ color: "#999", marginLeft: "0.4rem" }}>
                    · prazo: {new Date(stage.dueDate).toLocaleDateString("pt-BR")}
                  </span>
                )}
              </div>
            </div>

            <select
              value={stage.status}
              onChange={(e) => updateStageStatus(stage.id, e.target.value as StageStatus)}
              disabled={busy}
              style={{ padding: "0.3rem", fontSize: "0.85rem" }}
            >
              {Object.keys(STAGE_STATUS_LABEL).map((s) => (
                <option key={s} value={s}>
                  {STAGE_STATUS_LABEL[s as StageStatus]}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </main>
    </AppShell>
  );
}

const buttonSecondary: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: "4px",
  padding: "0.4rem 0.8rem",
  fontSize: "0.85rem",
  cursor: "pointer",
};

const buttonPrimary: React.CSSProperties = {
  background: "#111",
  color: "#fff",
  border: "none",
  borderRadius: "4px",
  padding: "0.4rem 0.8rem",
  fontSize: "0.85rem",
  cursor: "pointer",
};

const buttonDanger: React.CSSProperties = {
  background: "#fff",
  color: "#dc2626",
  border: "1px solid #dc2626",
  borderRadius: "4px",
  padding: "0.4rem 0.8rem",
  fontSize: "0.85rem",
  cursor: "pointer",
};
