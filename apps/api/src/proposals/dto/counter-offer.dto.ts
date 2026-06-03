import { IsNumber, Min } from 'class-validator';

export class CounterOfferDto {
  @IsNumber()
  @Min(0)
  amount!: number;
}
