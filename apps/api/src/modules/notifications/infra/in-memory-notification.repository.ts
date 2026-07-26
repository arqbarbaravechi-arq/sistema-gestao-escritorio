import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import {
  NotificationRecord,
  NotificationRepository,
  NotificationType,
} from "../domain/notification-repository.interface";

@Injectable()
export class InMemoryNotificationRepository implements NotificationRepository {
  private notifications: NotificationRecord[] = [];

  async create(data: {
    userId: string;
    type: NotificationType;
    referenceType: string;
    referenceId: string;
    message: string;
  }): Promise<NotificationRecord> {
    const notification: NotificationRecord = {
      id: randomUUID(),
      ...data,
      read: false,
      createdAt: new Date(),
    };
    this.notifications.push(notification);
    return notification;
  }

  async listByUser(userId: string, onlyUnread = false): Promise<NotificationRecord[]> {
    return this.notifications
      .filter((n) => n.userId === userId && (!onlyUnread || !n.read))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(id: string): Promise<NotificationRecord> {
    const notification = this.notifications.find((n) => n.id === id);
    if (!notification) throw new NotFoundException("Notificação não encontrada");
    notification.read = true;
    return notification;
  }

  async existsForReference(
    type: NotificationType,
    referenceType: string,
    referenceId: string,
  ): Promise<boolean> {
    return this.notifications.some(
      (n) => n.type === type && n.referenceType === referenceType && n.referenceId === referenceId,
    );
  }
}
