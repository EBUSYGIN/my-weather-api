import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class UserRegisterDTO {
  @IsEmail({}, { message: 'Неверный формат почты' })
  email: string;

  @IsString()
  @IsStrongPassword(
    {},
    { message: 'Пароль должен содержать минимум 8 символов, буквы, цифры и спец. символы' },
  )
  password: string;

  @IsString()
  name: string;
}
