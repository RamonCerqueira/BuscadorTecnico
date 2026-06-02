import { IsArray, IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MinLength } from 'class-validator';
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
}
