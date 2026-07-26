// Mesmo padrão de todo o resto do sistema: lógica de negócio depende
// só desta interface, nunca de Prisma diretamente.

export type NotificationType =
  | "ETAPA_ATRASADA"
  | "SUBENTREGA_PRONTA_REVISAO"
  | "RODADAS_ESGOTADAS"
  | "LEAD_SEM_FOLLOWUP"; // reservado para o CRM (Fase 1) — schema já compatível

export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  referenceType: string; // ex: "project", "project_stage"
  referenceId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface NotificationRepository {
  create(data: {
    userId: string;
    type: NotificationType;
    referenceType: string;
    referenceId: string;
    message: string;
  }): Promise<NotificationRecord>;

  listByUser(userId: string, onlyUnread?: boolean): Promise<NotificationRecord[]>;

  markAsRead(id: string): Promise<NotificationRecord>;

  // Usado para evitar notificar duas vezes a mesma coisa (ex: mesma
  // etapa atrasada não deve gerar notificação repetida a cada verificação).
  existsForReference(
    type: NotificationType,
    referenceType: string,
    referenceId: string,
  ): Promise<boolean>;
}

export const NOTIFICATION_REPOSITORY = Symbol("NOTIFICATION_REPOSITORY");
