import { Test } from "@nestjs/testing";
import { NotificationsService } from "./notifications.service";
import { NOTIFICATION_REPOSITORY } from "./domain/notification-repository.interface";
import { InMemoryNotificationRepository } from "./infra/in-memory-notification.repository";

describe("NotificationsService", () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        NotificationsService,
        InMemoryNotificationRepository,
        { provide: NOTIFICATION_REPOSITORY, useExisting: InMemoryNotificationRepository },
      ],
    }).compile();

    service = moduleRef.get(NotificationsService);
  });

  it("cria e lista notificação para o usuário correto", async () => {
    await service.notifyUser("user-1", "ETAPA_ATRASADA", "project_stage", "stage-1", "Etapa atrasada");

    const list = await service.listForUser("user-1");
    expect(list).toHaveLength(1);
    expect(list[0].message).toBe("Etapa atrasada");
  });

  it("não mistura notificações de usuários diferentes", async () => {
    await service.notifyUser("user-1", "ETAPA_ATRASADA", "project_stage", "stage-1", "Para user-1");
    await service.notifyUser("user-2", "ETAPA_ATRASADA", "project_stage", "stage-2", "Para user-2");

    const listUser1 = await service.listForUser("user-1");
    expect(listUser1).toHaveLength(1);
    expect(listUser1[0].message).toBe("Para user-1");
  });

  it("marca notificação como lida", async () => {
    const created = await service.notifyUser("user-1", "ETAPA_ATRASADA", "project_stage", "stage-1", "msg");
    const updated = await service.markAsRead(created.id);

    expect(updated.read).toBe(true);
  });

  it("filtra apenas não lidas quando solicitado", async () => {
    const n1 = await service.notifyUser("user-1", "ETAPA_ATRASADA", "project_stage", "s1", "msg1");
    await service.notifyUser("user-1", "ETAPA_ATRASADA", "project_stage", "s2", "msg2");
    await service.markAsRead(n1.id);

    const unread = await service.listForUser("user-1", true);
    expect(unread).toHaveLength(1);
    expect(unread[0].message).toBe("msg2");
  });

  it("notifyUserOnce não duplica notificação para a mesma referência", async () => {
    const first = await service.notifyUserOnce(
      "user-1",
      "ETAPA_ATRASADA",
      "project_stage",
      "stage-1",
      "msg",
    );
    const second = await service.notifyUserOnce(
      "user-1",
      "ETAPA_ATRASADA",
      "project_stage",
      "stage-1",
      "msg",
    );

    expect(first).not.toBeNull();
    expect(second).toBeNull();

    const list = await service.listForUser("user-1");
    expect(list).toHaveLength(1);
  });

  it("notifyUserOnce permite tipos diferentes para a mesma referência", async () => {
    await service.notifyUserOnce("user-1", "ETAPA_ATRASADA", "project_stage", "stage-1", "atraso");
    await service.notifyUserOnce(
      "user-1",
      "SUBENTREGA_PRONTA_REVISAO",
      "project_stage",
      "stage-1",
      "revisao",
    );

    const list = await service.listForUser("user-1");
    expect(list).toHaveLength(2);
  });
});
