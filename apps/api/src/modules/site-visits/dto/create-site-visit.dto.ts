import { IsBoolean, IsDateString, IsOptional, IsString, MinLength } from "class-validator";

export class CreateSiteVisitDto {
  @IsString()
  @MinLength(1)
  observation!: string;

  @IsOptional()
  @IsBoolean()
  communicateToClient?: boolean;

  @IsOptional()
  @IsDateString()
  visitDate?: string;
}
