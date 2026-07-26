import { Inject, Injectable } from "@nestjs/common";
import {
  NOTIFICATION_REPOSITORY,
  NotificationRepository,
  NotificationType,
} from "./domain/notification-repository.interface";

@Injectable()
export class NotificationsService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY) private readonly repo: NotificationRepository,
  ) {}

  async notifyUser(
    userId: string,
    type: NotificationType,
    referenceType: string,
    referenceId: string,
    message: string,
  ) {
    return this.repo.create({ userId, type, referenceType, referenceId, message });
  }

  // Evita notificação duplicada para a mesma etapa/tipo — chamado antes
  // de criar alertas gerados automaticamente (ex: verificação de atraso).
  async notifyUserOnce(
    userId: string,
    type: NotificationType,
    referenceType: string,
    referenceId: string,
    message: string,
  ) {
    const alreadyExists = await this.repo.existsForReference(type, referenceType, referenceId);
    if (alreadyExists) return null;
    return this.repo.create({ userId, type, referenceType, referenceId, message });
  }

  async listForUser(userId: string, onlyUnread = false) {
    return this.repo.listByUser(userId, onlyUnread);
  }

  async markAsRead(id: string) {
    return this.repo.markAsRead(id);
  }
}
