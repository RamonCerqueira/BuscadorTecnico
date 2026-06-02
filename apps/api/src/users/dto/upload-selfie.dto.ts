import { IsNotEmpty, IsUrl } from 'class-validator';

export class UploadSelfieDto {
  @IsNotEmpty({ message: 'A URL da selfie é obrigatória' })
  @IsUrl({}, { message: 'A URL da selfie deve ser válida' })
  selfieUrl!: string;
}
