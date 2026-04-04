import { IsEmail, IsString, ValidateIf } from 'class-validator';

export class UserUpdateDTO {
  @ValidateIf((o) => o.newEmail !== undefined)
  @IsString()
  @IsEmail({}, { message: 'Неверная почта' })
  newEmail?: string;

  @ValidateIf((o) => o.photoId !== undefined)
  @IsString()
  photoId?: string;

  @ValidateIf((o) => o.name !== undefined)
  @IsString()
  name?: string;
}
