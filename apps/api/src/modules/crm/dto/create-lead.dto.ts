import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

const ORIGINS = ["INSTAGRAM_ORGANICO", "INSTAGRAM_PAGO", "INDICACAO", "OUTRO"] as const;

export class CreateLeadDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsIn(ORIGINS)
  origin!: (typeof ORIGINS)[number];

  @IsOptional()
  @IsString()
  projectType?: string;

  @IsOptional()
  @IsString()
  budgetRange?: string;

  @IsOptional()
  @IsString()
  desiredDeadline?: string;
}
