import { IsEmail, IsString } from 'class-validator';

export class UserLoginDTO {
  @IsEmail({}, { message: 'Неправильный формат почты' })
  email: string;

  @IsString()
  password: string;
}
