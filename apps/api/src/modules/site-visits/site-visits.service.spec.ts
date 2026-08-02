import { Test } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { SiteVisitsService } from "./site-visits.service";
import { SITE_VISIT_REPOSITORY } from "./domain/site-visit-repository.interface";
import { InMemorySiteVisitRepository } from "./infra/in-memory-site-visit.repository";

describe("SiteVisitsService", () => {
  let service: SiteVisitsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SiteVisitsService,
        InMemorySiteVisitRepository,
        { provide: SITE_VISIT_REPOSITORY, useExisting: InMemorySiteVisitRepository },
      ],
    }).compile();

    service = moduleRef.get(SiteVisitsService);
  });

  it("registra uma visita com observação e responsável", async () => {
    const visit = await service.registerVisit(
      "org-1",
      "project-1",
      "Alvenaria da cozinha concluída, aguardando revestimento",
      false,
      "user-socia",
    );

    expect(visit.observation).toContain("Alvenaria");
    expect(visit.registeredBy).toBe("user-socia");
    expect(visit.communicateToClient).toBe(false);
  });

  it("rejeita registrar visita sem observação", async () => {
    await expect(
      service.registerVisit("org-1", "project-1", "", false, "user-socia"),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.registerVisit("org-1", "project-1", "   ", false, "user-socia"),
    ).rejects.toThrow(BadRequestException);
  });

  it("permite marcar uma visita para comunicar ao cliente (rastro jurídico)", async () => {
    const visit = await service.registerVisit(
      "org-1",
      "project-1",
      "Erro de execução identificado no piso — cliente precisa ser avisado",
      true,
      "user-socia",
    );

    expect(visit.communicateToClient).toBe(true);
  });

  it("lista visitas apenas do projeto correto, mais recente primeiro", async () => {
    await service.registerVisit("org-1", "project-1", "Visita 1", false, "user-socia");
    await service.registerVisit("org-1", "project-2", "Visita de outro projeto", false, "user-socia");
    const visit3 = await service.registerVisit("org-1", "project-1", "Visita 2", false, "user-socia");

    const list = await service.listForProject("project-1");

    expect(list).toHaveLength(2);
    expect(list[0].id).toBe(visit3.id);
  });

  it("usa a data atual como padrão quando visitDate não é informado", async () => {
    const before = Date.now();
    const visit = await service.registerVisit("org-1", "project-1", "Visita hoje", false, "user-socia");
    const after = Date.now();

    expect(visit.visitDate.getTime()).toBeGreaterThanOrEqual(before);
    expect(visit.visitDate.getTime()).toBeLessThanOrEqual(after);
  });
});
