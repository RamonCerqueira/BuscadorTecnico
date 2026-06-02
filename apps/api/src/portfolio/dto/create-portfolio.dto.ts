import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  beforeUrl!: string;

  @IsString()
  @IsNotEmpty()
  afterUrl!: string;

  @IsString()
  @IsOptional()
  category?: string;
}
