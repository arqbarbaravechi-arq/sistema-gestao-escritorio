import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { PROJECT_REPOSITORY } from "./domain/project-repository.interface";
import { InMemoryProjectRepository } from "./infra/in-memory-project.repository";

describe("ProjectsService", () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProjectsService,
        InMemoryProjectRepository,
        { provide: PROJECT_REPOSITORY, useExisting: InMemoryProjectRepository },
      ],
    }).compile();

    service = moduleRef.get(ProjectsService);
  });

  describe("criação de projeto e etapas automáticas", () => {
    it("cria um projeto vinculado à organização correta", async () => {
      const { project } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");

      expect(project.organizationId).toBe("org-1");
      expect(project.name).toBe("Casa Boa Vista");
      expect(project.status).toBe("ATIVO");
    });

    it("cria automaticamente as 8 etapas padrão, na ordem correta", async () => {
      const { stages } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");

      expect(stages).toHaveLength(8);
      expect(stages.map((s) => s.type)).toEqual([
        "BRIEFING",
        "MEDICAO",
        "ASBUILT",
        "LAYOUT",
        "EXECUTIVO",
        "ORCAMENTO",
        "OBRA",
        "ENTREGA",
      ]);
      expect(stages.every((s) => s.status === "NAO_INICIADO")).toBe(true);
    });

    it("não lista projeto de outra organização", async () => {
      await service.createProject("org-1", "Projeto A", "INTERIORES");
      await service.createProject("org-2", "Projeto B", "INTERIORES");

      const listaOrg1 = await service.listProjects("org-1");

      expect(listaOrg1).toHaveLength(1);
      expect(listaOrg1[0].name).toBe("Projeto A");
    });
  });

  describe("regra de negócio: etapa atrasada (PRD v2.0 §3.3)", () => {
    const ontem = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000);

    it("considera atrasada uma etapa com prazo no passado e status não aprovado", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(true);
    });

    it("NÃO considera atrasada uma etapa com prazo no futuro", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: amanha,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(false);
    });

    it("NÃO considera atrasada uma etapa já aprovada, mesmo com prazo vencido", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "APROVADO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: new Date(),
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(false);
    });

    it("NÃO considera atrasada uma etapa sem prazo definido", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: null,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(false);
    });

    it("NÃO considera atrasada nenhuma etapa de projeto PAUSADO, mesmo com prazo vencido", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "PAUSADO")).toBe(false);
    });

    it("NÃO considera atrasada nenhuma etapa de projeto CANCELADO", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "CANCELADO")).toBe(false);
    });

    it("NÃO considera atrasada uma etapa em modo exceção (ciclo aberto), mesmo com prazo vencido", () => {
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "CICLO_ABERTO" as const,
        responsibleId: null,
        dueDate: ontem,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(false);
    });

    it("não aplica tolerância de carência — 1 segundo após o prazo já é atrasado", () => {
      const umSegundoAtras = new Date(Date.now() - 1000);
      const stage = {
        id: "s1",
        projectId: "p1",
        type: "EXECUTIVO" as const,
        status: "EM_ANDAMENTO" as const,
        mode: "PADRAO" as const,
        responsibleId: null,
        dueDate: umSegundoAtras,
        completedAt: null,
      };

      expect(service.isStageLate(stage, "ATIVO")).toBe(true);
    });
  });

  describe("rodada de revisão — CR-000 (2 por projeto, não por etapa)", () => {
    it("permite registrar a 1ª e a 2ª rodada normalmente", async () => {
      const { project } = await service.createProject("org-1", "Apto Itacorubi", "INTERIORES");

      const r1 = await service.addRevisionRound(project.id, "cliente", "ajuste 1");
      const r2 = await service.addRevisionRound(project.id, "cliente", "ajuste 2");

      expect(r1.number).toBe(1);
      expect(r2.number).toBe(2);
    });

    it("bloqueia a 3ª rodada e orienta a criar um orçamento (aditivo), não permite como 'rodada extra'", async () => {
      const { project } = await service.createProject("org-1", "Apto Itacorubi", "INTERIORES");

      await service.addRevisionRound(project.id, "cliente", "ajuste 1");
      await service.addRevisionRound(project.id, "cliente", "ajuste 2");

      await expect(
        service.addRevisionRound(project.id, "cliente", "ajuste 3"),
      ).rejects.toThrow(BadRequestException);

      try {
        await service.addRevisionRound(project.id, "cliente", "ajuste 3");
      } catch (e) {
        const response = (e as BadRequestException).getResponse() as Record<string, unknown>;
        expect(response.code).toBe("REVISION_ROUNDS_EXHAUSTED");
        expect(response.suggestedAction).toBe("CREATE_BUDGET_AMENDMENT");
      }
    });

    it("a contagem de rodadas é por PROJETO INTEIRO, não some entre projetos diferentes", async () => {
      const { project: p1 } = await service.createProject("org-1", "Projeto 1", "INTERIORES");
      const { project: p2 } = await service.createProject("org-1", "Projeto 2", "INTERIORES");

      await service.addRevisionRound(p1.id, "cliente", "ajuste");
      await service.addRevisionRound(p1.id, "cliente", "ajuste");

      const r1 = await service.addRevisionRound(p2.id, "cliente", "ajuste");
      expect(r1.number).toBe(1);
    });

    it("cria um orçamento/aditivo vinculado ao projeto", async () => {
      const { project } = await service.createProject("org-1", "Apto Itacorubi", "INTERIORES");

      const amendment = await service.createBudgetAmendment(
        project.id,
        "Cliente pediu 3ª rodada de ajustes",
      );

      expect(amendment.projectId).toBe(project.id);
      expect(amendment.reason).toContain("3ª rodada");
    });
  });

  describe("modo exceção (S1-9)", () => {
    it("permite marcar uma etapa como ciclo aberto", async () => {
      const { stages } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");
      const stage = stages[4]; // EXECUTIVO

      const updated = await service.setStageMode(stage.id, "CICLO_ABERTO");

      expect(updated.mode).toBe("CICLO_ABERTO");
    });

    it("permite registrar interação livre em etapa que está em ciclo aberto", async () => {
      const { stages } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");
      const stage = stages[4];

      await service.setStageMode(stage.id, "CICLO_ABERTO");
      const note = await service.addOpenCycleNote(stage.id, "Cliente pediu nova versão da cozinha");

      expect(note.description).toBe("Cliente pediu nova versão da cozinha");
    });

    it("bloqueia registro de interação livre em etapa que NÃO está em ciclo aberto", async () => {
      const { stages } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");
      const stage = stages[4]; // ainda em modo PADRAO

      await expect(
        service.addOpenCycleNote(stage.id, "Tentativa indevida"),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("pausado/cancelado (S1-10)", () => {
    it("pausa um projeto exigindo motivo", async () => {
      const { project } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");

      const updated = await service.pauseProject(project.id, "org-1", "Cliente pediu tempo");

      expect(updated.status).toBe("PAUSADO");
      expect(updated.statusReason).toBe("Cliente pediu tempo");
    });

    it("rejeita pausar sem informar motivo", async () => {
      const { project } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");

      await expect(service.pauseProject(project.id, "org-1", "")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("cancela um projeto exigindo motivo", async () => {
      const { project } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");

      const updated = await service.cancelProject(project.id, "org-1", "Cliente desistiu");

      expect(updated.status).toBe("CANCELADO");
    });

    it("rejeita pausar/cancelar projeto de outra organização (isolamento multi-tenant)", async () => {
      const { project } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");

      await expect(
        service.pauseProject(project.id, "org-2", "Motivo qualquer"),
      ).rejects.toThrow(NotFoundException);
    });

    it("reativa um projeto pausado", async () => {
      const { project } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");
      await service.pauseProject(project.id, "org-1", "Pausa temporária");

      const reactivated = await service.reactivateProject(project.id, "org-1");

      expect(reactivated.status).toBe("ATIVO");
      expect(reactivated.statusReason).toBeNull();
    });
  });

  describe("sub-entregas (S1-7)", () => {
    it("permite adicionar sub-entregas com responsáveis diferentes na etapa Executivo", async () => {
      const { stages } = await service.createProject("org-1", "Casa Boa Vista", "INTERIORES");
      const executivo = stages.find((s) => s.type === "EXECUTIVO")!;

      const d1 = await service.addDeliverable(executivo.id, "Executivo de obra", "user-vitoria", null);
      const d2 = await service.addDeliverable(
        executivo.id,
        "Caderno de interiores",
        "user-thaina",
        null,
      );

      expect(d1.responsibleId).toBe("user-vitoria");
      expect(d2.responsibleId).toBe("user-thaina");
      expect(d1.name).not.toBe(d2.name);
    });
  });
});
