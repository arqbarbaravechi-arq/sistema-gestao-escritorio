// Horas Trabalhadas / Timers — inspirado no cronômetro do dashboard
// visto na referência (Monsi), com o mesmo comportamento: só um timer
// rodando por vez por pessoa; parar o timer calcula a duração.

export interface TimeEntryRecord {
  id: string;
  organizationId: string;
  userId: string;
  projectId: string;
  description: string | null;
  startedAt: Date;
  endedAt: Date | null;
  createdAt: Date;
}

export interface TimeEntryRepository {
  create(data: {
    organizationId: string;
    userId: string;
    projectId: string;
    description: string | null;
    startedAt: Date;
  }): Promise<TimeEntryRecord>;

  findRunningByUser(userId: string): Promise<TimeEntryRecord | null>;
  findById(id: string): Promise<TimeEntryRecord | null>;
  listByProject(projectId: string): Promise<TimeEntryRecord[]>;
  stop(id: string, endedAt: Date): Promise<TimeEntryRecord>;
}

export const TIME_ENTRY_REPOSITORY = Symbol("TIME_ENTRY_REPOSITORY");
