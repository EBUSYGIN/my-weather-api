import { IsString } from 'class-validator';

export class UserFavoriteCityDTO {
  @IsString({ message: 'Неправильный формат данных' })
  favoriteCity: string;
}
