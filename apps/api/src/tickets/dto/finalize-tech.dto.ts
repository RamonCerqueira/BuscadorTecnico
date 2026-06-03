import { IsNumber, Min } from 'class-validator';

export class FinalizeTechDto {
  @IsNumber()
  @Min(0)
  amount!: number;
}
