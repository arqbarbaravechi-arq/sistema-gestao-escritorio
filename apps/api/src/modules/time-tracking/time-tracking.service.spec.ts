import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { TimeTrackingService } from "./time-tracking.service";
import { TIME_ENTRY_REPOSITORY } from "./domain/time-entry-repository.interface";
import { InMemoryTimeEntryRepository } from "./infra/in-memory-time-entry.repository";

describe("TimeTrackingService", () => {
  let service: TimeTrackingService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TimeTrackingService,
        InMemoryTimeEntryRepository,
        { provide: TIME_ENTRY_REPOSITORY, useExisting: InMemoryTimeEntryRepository },
      ],
    }).compile();

    service = moduleRef.get(TimeTrackingService);
  });

  describe("iniciar e parar cronômetro", () => {
    it("inicia um cronômetro sem endedAt (rodando)", async () => {
      const entry = await service.startTimer("org-1", "user-1", "project-1", "Executivo");

      expect(entry.endedAt).toBeNull();
      expect(entry.projectId).toBe("project-1");
    });

    it("rejeita iniciar um segundo cronômetro enquanto o primeiro está rodando", async () => {
      await service.startTimer("org-1", "user-1", "project-1", null);

      await expect(service.startTimer("org-1", "user-1", "project-2", null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("permite iniciar um novo cronômetro depois de parar o anterior", async () => {
      await service.startTimer("org-1", "user-1", "project-1", null);
      await service.stopTimer("user-1");

      const second = await service.startTimer("org-1", "user-1", "project-2", null);
      expect(second.endedAt).toBeNull();
    });

    it("para o cronômetro em andamento, registrando endedAt", async () => {
      await service.startTimer("org-1", "user-1", "project-1", null);

      const stopped = await service.stopTimer("user-1");

      expect(stopped.endedAt).not.toBeNull();
    });

    it("rejeita parar quando não há cronômetro em andamento", async () => {
      await expect(service.stopTimer("user-sem-timer")).rejects.toThrow(NotFoundException);
    });

    it("usuários diferentes podem ter cronômetros rodando ao mesmo tempo", async () => {
      const entry1 = await service.startTimer("org-1", "user-1", "project-1", null);
      const entry2 = await service.startTimer("org-1", "user-2", "project-1", null);

      expect(entry1.endedAt).toBeNull();
      expect(entry2.endedAt).toBeNull();
    });
  });

  describe("consulta de cronômetro em andamento", () => {
    it("retorna null quando não há cronômetro rodando", async () => {
      const running = await service.getRunningTimer("user-1");
      expect(running).toBeNull();
    });

    it("retorna o cronômetro correto quando está rodando", async () => {
      await service.startTimer("org-1", "user-1", "project-1", "Briefing");

      const running = await service.getRunningTimer("user-1");
      expect(running?.description).toBe("Briefing");
    });
  });

  describe("total de horas por projeto", () => {
    it("soma corretamente múltiplos registros já parados", async () => {
      const repo = new InMemoryTimeEntryRepository();
      const svc = new TimeTrackingService(repo);

      const e1 = await repo.create({
        organizationId: "org-1",
        userId: "user-1",
        projectId: "project-1",
        description: null,
        startedAt: new Date(Date.now() - 3600 * 1000),
      });
      await repo.stop(e1.id, new Date());

      const e2 = await repo.create({
        organizationId: "org-1",
        userId: "user-1",
        projectId: "project-1",
        description: null,
        startedAt: new Date(Date.now() - 1800 * 1000),
      });
      await repo.stop(e2.id, new Date());

      const total = await svc.getProjectTotalSeconds("project-1");

      expect(total).toBeGreaterThan(3600 + 1800 - 5);
      expect(total).toBeLessThan(3600 + 1800 + 5);
    });

    it("NÃO conta o tempo do cronômetro ainda em andamento no total", async () => {
      await service.startTimer("org-1", "user-1", "project-1", null);

      const total = await service.getProjectTotalSeconds("project-1");
      expect(total).toBe(0);
    });

    it("retorna zero para projeto sem nenhum registro", async () => {
      const total = await service.getProjectTotalSeconds("project-sem-registros");
      expect(total).toBe(0);
    });
  });
});
