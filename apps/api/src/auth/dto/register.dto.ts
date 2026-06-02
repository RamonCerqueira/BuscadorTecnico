import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength, ValidateIf } from 'class-validator';
import { UserType } from '@prisma/client';

export class RegisterDto {
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'A senha deve conter pelo menos uma letra maiúscula, um número ou caractere especial',
  })
  password!: string;

  @IsEnum(UserType)
  userType!: UserType;

  @IsNotEmpty({ message: 'Você precisa aceitar os termos de uso e política de privacidade' })
  @IsBoolean()
  acceptTerms!: boolean;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  certificates?: string[];

  @ValidateIf((o) => o.userType === 'technician' || o.userType === 'company')
  @IsNotEmpty({ message: 'Documento (CPF ou CNPJ) é obrigatório' })
  @IsString()
  document?: string;

  @ValidateIf((o) => o.userType === 'technician' || o.userType === 'company')
  @IsNotEmpty({ message: 'Endereço é obrigatório' })
  @IsString()
  address?: string;

  @ValidateIf((o) => o.userType === 'technician' || o.userType === 'company')
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @IsString()
  city?: string;

  @ValidateIf((o) => o.userType === 'technician' || o.userType === 'company')
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @IsString()
  state?: string;

  @ValidateIf((o) => o.userType === 'technician' || o.userType === 'company')
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @IsString()
  zipCode?: string;
}
