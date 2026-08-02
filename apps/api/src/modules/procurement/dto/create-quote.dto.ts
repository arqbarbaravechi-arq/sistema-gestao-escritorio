import { IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateQuoteDto {
  @IsString()
  supplierId!: string;

  @IsNumber()
  @IsPositive()
  value!: number;

  @IsOptional()
  @IsString()
  description?: string;
}
