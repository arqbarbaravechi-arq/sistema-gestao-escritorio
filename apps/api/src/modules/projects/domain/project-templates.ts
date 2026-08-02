import { StageType } from "./project-repository.interface";

// Templates de Projeto (CR-001, item 2) — modelos prontos com prazos
// padrão por etapa, para reduzir o trabalho manual de definir prazo
// etapa por etapa a cada novo projeto.
//
// stageDurations: quantos dias, a partir da criação do projeto, cada
// etapa deve estar concluída (cumulativo, não duração isolada — ex:
// se BRIEFING=5 e MEDICAO=12, a Medição tem prazo total de 12 dias
// desde o início, não 12 dias depois do Briefing).
//
// Os números refletem o prazo médio de 30-40 dias relatado no Discovery
// original para projetos de interiores — ajustáveis conforme uso real.

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  stageDurations: Partial<Record<StageType, number>>;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "interiores-padrao",
    name: "Interiores — Padrão",
    description: "Fluxo completo de projeto de interiores, prazo total de ~35 dias.",
    stageDurations: {
      BRIEFING: 3,
      MEDICAO: 7,
      ESTUDO_PRELIMINAR: 12,
      LAYOUT: 18,
      EXECUTIVO: 28,
      ORCAMENTO: 32,
      OBRA: 35,
      ENTREGA: 35,
    },
  },
  {
    id: "arquitetonico-residencial",
    name: "Arquitetônico Residencial",
    description: "Projeto arquitetônico completo, prazo total de ~50 dias.",
    stageDurations: {
      BRIEFING: 5,
      MEDICAO: 10,
      ESTUDO_PRELIMINAR: 15,
      LAYOUT: 25,
      EXECUTIVO: 40,
      ORCAMENTO: 45,
      OBRA: 50,
      ENTREGA: 50,
    },
  },
  {
    id: "consultoria-rapida",
    name: "Consultoria Rápida",
    description: "Fluxo enxuto para consultorias pontuais, prazo total de ~12 dias.",
    stageDurations: {
      BRIEFING: 2,
      MEDICAO: 4,
      LAYOUT: 10,
      ENTREGA: 12,
    },
  },
];

export function findTemplate(id: string): ProjectTemplate | undefined {
  return PROJECT_TEMPLATES.find((t) => t.id === id);
}
