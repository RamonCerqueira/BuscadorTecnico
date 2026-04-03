import { IsNotEmpty, IsString } from 'class-validator';

export class DecisionProposalDto {
  @IsString()
  @IsNotEmpty()
  clientId!: string;
}
