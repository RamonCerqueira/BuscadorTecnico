import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRefundDto {
  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsNumber()
  @IsNotEmpty()
  amount!: number;

  @IsString()
  @IsNotEmpty()
  receiptUrl!: string;
}
