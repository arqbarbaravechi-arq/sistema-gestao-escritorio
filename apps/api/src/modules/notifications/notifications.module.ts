import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import { NOTIFICATION_REPOSITORY } from "./domain/notification-repository.interface";
import { InMemoryNotificationRepository } from "./infra/in-memory-notification.repository";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET ?? "dev-secret-trocar-em-producao",
      signOptions: { expiresIn: "8h" },
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    InMemoryNotificationRepository,
    { provide: NOTIFICATION_REPOSITORY, useExisting: InMemoryNotificationRepository },
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
