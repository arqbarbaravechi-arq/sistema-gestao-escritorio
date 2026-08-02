import { Test } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { ProcurementService } from "./procurement.service";
import { PROCUREMENT_REPOSITORY } from "./domain/procurement-repository.interface";
import { InMemoryProcurementRepository } from "./infra/in-memory-procurement.repository";

describe("ProcurementService", () => {
  let service: ProcurementService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ProcurementService,
        InMemoryProcurementRepository,
        { provide: PROCUREMENT_REPOSITORY, useExisting: InMemoryProcurementRepository },
      ],
    }).compile();

    service = moduleRef.get(ProcurementService);
  });

  describe("fornecedores", () => {
    it("cadastra fornecedor com categoria", async () => {
      const supplier = await service.createSupplier("org-1", "Marcenaria Sul", "MARCENARIA", null);
      expect(supplier.name).toBe("Marcenaria Sul");
      expect(supplier.category).toBe("MARCENARIA");
    });

    it("lista apenas fornecedores da organização correta", async () => {
      await service.createSupplier("org-1", "Fornecedor A", "MARCENARIA", null);
      await service.createSupplier("org-2", "Fornecedor B", "MARCENARIA", null);

      const lista = await service.listSuppliers("org-1");
      expect(lista).toHaveLength(1);
      expect(lista[0].name).toBe("Fornecedor A");
    });
  });

  describe("cotações", () => {
    it("registra cotação vinculada ao projeto e herda a categoria do fornecedor", async () => {
      const supplier = await service.createSupplier("org-1", "Marcenaria Sul", "MARCENARIA", null);
      const quote = await service.addQuote("org-1", "project-1", supplier.id, 18500, "Cozinha planejada");

      expect(quote.category).toBe("MARCENARIA");
      expect(quote.status).toBe("PENDENTE");
      expect(quote.value).toBe(18500);
    });

    it("rejeita cotação com valor zero ou negativo", async () => {
      const supplier = await service.createSupplier("org-1", "Marcenaria Sul", "MARCENARIA", null);

      await expect(service.addQuote("org-1", "project-1", supplier.id, 0, null)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addQuote("org-1", "project-1", supplier.id, -100, null)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("rejeita cotação de fornecedor inexistente", async () => {
      await expect(
        service.addQuote("org-1", "project-1", "fornecedor-que-nao-existe", 1000, null),
      ).rejects.toThrow(NotFoundException);
    });

    it("rejeita cotação de fornecedor de outra organização (isolamento multi-tenant)", async () => {
      const supplier = await service.createSupplier("org-2", "Fornecedor Org2", "MARCENARIA", null);

      await expect(
        service.addQuote("org-1", "project-1", supplier.id, 1000, null),
      ).rejects.toThrow(NotFoundException);
    });

    it("lista cotações do projeto ordenadas do menor para o maior valor", async () => {
      const s1 = await service.createSupplier("org-1", "Fornecedor Caro", "MARCENARIA", null);
      const s2 = await service.createSupplier("org-1", "Fornecedor Barato", "MARCENARIA", null);

      await service.addQuote("org-1", "project-1", s1.id, 20000, null);
      await service.addQuote("org-1", "project-1", s2.id, 15000, null);

      const list = await service.listQuotesForProject("project-1");
      expect(list[0].value).toBe(15000);
      expect(list[1].value).toBe(20000);
    });
  });

  describe("aprovação e comparação de cotações (regra central da Gestão de Compras)", () => {
    it("ao aprovar uma cotação, as outras PENDENTES da mesma categoria/projeto são recusadas automaticamente", async () => {
      const s1 = await service.createSupplier("org-1", "Marcenaria A", "MARCENARIA", null);
      const s2 = await service.createSupplier("org-1", "Marcenaria B", "MARCENARIA", null);
      const s3 = await service.createSupplier("org-1", "Marcenaria C", "MARCENARIA", null);

      const q1 = await service.addQuote("org-1", "project-1", s1.id, 18000, null);
      await service.addQuote("org-1", "project-1", s2.id, 20000, null);
      await service.addQuote("org-1", "project-1", s3.id, 17000, null);

      const result = await service.approveQuote(q1.id);

      expect(result.approved.status).toBe("APROVADA");
      expect(result.rejectedCount).toBe(2);

      const allQuotes = await service.listQuotesForProject("project-1");
      const rejected = allQuotes.filter((q) => q.status === "RECUSADA");
      expect(rejected).toHaveLength(2);
    });

    it("NÃO afeta cotações de categoria diferente ao aprovar", async () => {
      const marcenaria = await service.createSupplier("org-1", "Marcenaria X", "MARCENARIA", null);
      const marmoraria = await service.createSupplier("org-1", "Marmoraria Y", "MARMORARIA", null);

      const quoteMarcenaria = await service.addQuote("org-1", "project-1", marcenaria.id, 18000, null);
      await service.addQuote("org-1", "project-1", marmoraria.id, 6000, null);

      await service.approveQuote(quoteMarcenaria.id);

      const marmorariaQuote = (await service.listQuotesForProject("project-1")).find(
        (q) => q.category === "MARMORARIA",
      );
      expect(marmorariaQuote!.status).toBe("PENDENTE");
    });

    it("NÃO afeta cotações de outro projeto, mesmo com a mesma categoria", async () => {
      const supplier = await service.createSupplier("org-1", "Marcenaria X", "MARCENARIA", null);

      const quoteProjeto1 = await service.addQuote("org-1", "project-1", supplier.id, 18000, null);
      await service.addQuote("org-1", "project-2", supplier.id, 19000, null);

      await service.approveQuote(quoteProjeto1.id);

      const projeto2Quote = (await service.listQuotesForProject("project-2"))[0];
      expect(projeto2Quote.status).toBe("PENDENTE");
    });

    it("rejeita aprovar cotação inexistente", async () => {
      await expect(service.approveQuote("cotacao-que-nao-existe")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("Curva ABC de Custos (CR-001, item 4)", () => {
    it("classifica corretamente A/B/C usando um exemplo numérico conhecido (800/150/50, total 1000)", async () => {
      const s1 = await service.createSupplier("org-1", "Fornecedor 800", "OBRA_CIVIL", null);
      const s2 = await service.createSupplier("org-1", "Fornecedor 150", "MARCENARIA", null);
      const s3 = await service.createSupplier("org-1", "Fornecedor 50", "MARMORARIA", null);

      const q1 = await service.addQuote("org-1", "project-1", s1.id, 800, null);
      const q2 = await service.addQuote("org-1", "project-1", s2.id, 150, null);
      const q3 = await service.addQuote("org-1", "project-1", s3.id, 50, null);

      await service.approveQuote(q1.id);
      // q1 aprovado já recusa concorrentes da MESMA categoria — mas s2 e
      // s3 são de categorias diferentes, então aprová-los também funciona.
      await service.approveQuote(q2.id);
      await service.approveQuote(q3.id);

      const curve = await service.getABCCurve("project-1");

      expect(curve.totalValue).toBe(1000);
      expect(curve.items).toHaveLength(3);

      // Item de 800: 80% acumulado exatamente -> Classe A (regra <= 80)
      expect(curve.items[0].value).toBe(800);
      expect(curve.items[0].cumulativePercentage).toBe(80);
      expect(curve.items[0].classification).toBe("A");

      // Item de 150: acumulado 950/1000 = 95% -> Classe B (regra <= 95)
      expect(curve.items[1].value).toBe(150);
      expect(curve.items[1].cumulativePercentage).toBe(95);
      expect(curve.items[1].classification).toBe("B");

      // Item de 50: acumulado 1000/1000 = 100% -> Classe C
      expect(curve.items[2].value).toBe(50);
      expect(curve.items[2].cumulativePercentage).toBe(100);
      expect(curve.items[2].classification).toBe("C");

      expect(curve.summary).toEqual({ countA: 1, countB: 1, countC: 1 });
    });

    it("considera apenas cotações APROVADAS — ignora PENDENTES e RECUSADAS", async () => {
      const s1 = await service.createSupplier("org-1", "Fornecedor A", "MARCENARIA", null);
      const s2 = await service.createSupplier("org-1", "Fornecedor B", "MARCENARIA", null);

      const q1 = await service.addQuote("org-1", "project-1", s1.id, 1000, null);
      await service.addQuote("org-1", "project-1", s2.id, 2000, null); // fica PENDENTE

      await service.approveQuote(q1.id); // recusa a de 2000 automaticamente (mesma categoria)

      const curve = await service.getABCCurve("project-1");

      expect(curve.items).toHaveLength(1);
      expect(curve.totalValue).toBe(1000);
    });

    it("retorna curva vazia quando não há nenhuma cotação aprovada", async () => {
      const curve = await service.getABCCurve("project-sem-cotacoes");

      expect(curve.totalValue).toBe(0);
      expect(curve.items).toHaveLength(0);
      expect(curve.summary).toEqual({ countA: 0, countB: 0, countC: 0 });
    });

    it("ordena os itens do maior para o menor valor", async () => {
      const s1 = await service.createSupplier("org-1", "Fornecedor Pequeno", "MARCENARIA", null);
      const s2 = await service.createSupplier("org-1", "Fornecedor Grande", "MARMORARIA", null);

      const q1 = await service.addQuote("org-1", "project-1", s1.id, 100, null);
      const q2 = await service.addQuote("org-1", "project-1", s2.id, 900, null);
      await service.approveQuote(q1.id);
      await service.approveQuote(q2.id);

      const curve = await service.getABCCurve("project-1");

      expect(curve.items[0].value).toBe(900);
      expect(curve.items[1].value).toBe(100);
    });
  });
});
