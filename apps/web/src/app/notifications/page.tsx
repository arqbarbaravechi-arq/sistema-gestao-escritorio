"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { apiFetch } from "@/lib/api";

interface Notification {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  ETAPA_ATRASADA: "Etapa atrasada",
  SUBENTREGA_PRONTA_REVISAO: "Pronta para revisão",
  RODADAS_ESGOTADAS: "Rodadas de revisão esgotadas",
  LEAD_SEM_FOLLOWUP: "Lead sem follow-up",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Notification[]>("/notifications")
      .then(setNotifications)
      .catch((err) => setError(err instanceof Error ? err.message : "Erro ao carregar"));
  }, []);

  async function markAsRead(id: string) {
    await apiFetch(`/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev ? prev.map((n) => (n.id === id ? { ...n, read: true } : n)) : prev,
    );
  }

  return (
    <AppShell>
      <div style={{ padding: "2rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "1.3rem", margin: 0 }}>Notificações</h1>
        <p style={{ color: "var(--color-text-secondary)", marginTop: "0.5rem", fontSize: "0.85rem" }}>
          Geradas automaticamente pelo sistema (ex: rodadas de revisão esgotadas, etapas
          atrasadas).
        </p>

        {error && <p style={{ color: "var(--color-danger)", marginTop: "1rem" }}>{error}</p>}

        {!error && notifications === null && (
          <p style={{ color: "var(--color-text-secondary)", marginTop: "1rem" }}>Carregando...</p>
        )}

        {!error && notifications !== null && notifications.length === 0 && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "2rem",
              border: "1px dashed #ccc",
              borderRadius: "12px",
              textAlign: "center",
              color: "var(--color-text-secondary)",
            }}
          >
            Nenhuma notificação ainda.
          </div>
        )}

        {!error && notifications !== null && notifications.length > 0 && (
          <div style={{ marginTop: "1rem" }}>
            {notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  padding: "0.9rem 1rem",
                  border: "1px solid var(--color-border)",
                  borderRadius: "12px",
                  marginBottom: "0.5rem",
                  background: n.read ? "#fff" : "#fef9f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#c2410c", fontWeight: 600 }}>
                    {TYPE_LABELS[n.type] ?? n.type}
                  </div>
                  <div style={{ fontSize: "0.9rem", marginTop: "0.2rem" }}>{n.message}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "0.3rem" }}>
                    {new Date(n.createdAt).toLocaleString("pt-BR")}
                  </div>
                </div>
                {!n.read && (
                  <button
                    onClick={() => markAsRead(n.id)}
                    style={{
                      fontSize: "0.75rem",
                      background: "none",
                      border: "1px solid #ccc",
                      borderRadius: "999px",
                      padding: "0.25rem 0.6rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Marcar como lida
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
