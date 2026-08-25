import { IsOptional, IsString, MinLength } from "class-validator";

export class StartTimerDto {
  @IsString()
  @MinLength(1)
  projectId!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
