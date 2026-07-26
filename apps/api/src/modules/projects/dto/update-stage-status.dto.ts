import { IsIn, IsOptional, IsDateString } from "class-validator";

const STAGE_STATUSES = ["NAO_INICIADO", "EM_ANDAMENTO", "EM_REVISAO", "APROVADO", "ATRASADO"] as const;

export class UpdateStageStatusDto {
  @IsIn(STAGE_STATUSES)
  status!: (typeof STAGE_STATUSES)[number];

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
