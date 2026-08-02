import { IsIn } from "class-validator";

const STATUSES = [
  "NOVO",
  "QUALIFICADO",
  "REUNIAO_MARCADA",
  "AGUARDANDO_DECISAO",
  "FECHADO",
  "PERDIDO",
] as const;

export class UpdateLeadStatusDto {
  @IsIn(STATUSES)
  status!: (typeof STATUSES)[number];
}
