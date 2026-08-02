import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

const PROJECT_TYPES = ["INTERIORES", "ARQUITETONICO", "COMERCIAL", "CONSULTORIA"] as const;

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(PROJECT_TYPES)
  type!: (typeof PROJECT_TYPES)[number];

  @IsOptional()
  @IsString()
  templateId?: string;
}
