import { IsOptional, IsString } from "class-validator";

export class AddRevisionRoundDto {
  @IsOptional()
  @IsString()
  description?: string;
}
