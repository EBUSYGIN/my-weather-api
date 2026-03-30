import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class UserLoginDTO {
  @IsEmail({}, { message: 'Неправильный формат почты' })
  email: string;

  @IsString()
  @IsStrongPassword(
    {},
    { message: 'Пароль должен содержать минимум 8 символов, буквы, цифры и спец. символы' },
  )
  password: string;
}
