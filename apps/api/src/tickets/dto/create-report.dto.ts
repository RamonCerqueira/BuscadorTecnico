import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  description!: string;
}
