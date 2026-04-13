import { User } from '../../../../generated/prisma/client';
import { UserModel } from '../../../../generated/prisma/models';
import { UserLoginDTO } from '../dto/user-login.dto';
import { UserUpdateDTO } from '../dto/user-update.dto';

export interface IUserService {
  create: (name: string, email: string, password: string) => Promise<IUserRegister | string>;
  getUser: (id: string) => Promise<Partial<User> | null>;
  validateUser: (body: UserLoginDTO) => Promise<IUserTokensReturn | null>;
  updateTokens: (token: string) => Promise<IUserTokensReturn | null>;
  updateFavoriteCities: (id: string, favoriteCity: string) => Promise<UserModel | null>;
  updateUserInfo: (id: string, body: UserUpdateDTO) => Promise<Partial<UserModel>>;
}

export interface IUserTokensReturn {
  accessToken: string;
  refreshToken: string;
}

export interface IUserRegister {
  user: Partial<User>;
  accessToken: string;
  refreshToken: string;
}
