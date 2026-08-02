import { IsIn, IsOptional, IsString, MinLength } from "class-validator";

const CATEGORIES = ["MARCENARIA", "MARMORARIA", "OBRA_CIVIL", "OUTRO"] as const;

export class CreateSupplierDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsIn(CATEGORIES)
  category!: (typeof CATEGORIES)[number];

  @IsOptional()
  @IsString()
  contact?: string;
}
