import { IsString, IsNotEmpty } from 'class-validator';

export class CreateSupportTicketDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string; // 'Senha/Acesso', 'Denunciar Usuário', 'Erro no Sistema', 'Dúvidas', 'Outros'

  @IsString()
  @IsNotEmpty()
  description!: string;
}
