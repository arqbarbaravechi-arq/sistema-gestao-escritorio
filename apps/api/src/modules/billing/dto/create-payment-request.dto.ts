import { IsDateString, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreatePaymentRequestDto {
  @IsString()
  @MinLength(1)
  description!: string;

  @IsNumber()
  @IsPositive()
  value!: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
