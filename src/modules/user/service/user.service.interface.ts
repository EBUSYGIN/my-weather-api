import { User } from '../../../../generated/prisma/client';
import { UserLoginDTO } from '../dto/user-login.dto';

export interface IUserService {
  create: (name: string, email: string, password: string) => Promise<IUserRegister | string>;
  getUser: (email: string) => Promise<Partial<User> | null>;
  validateUser: (body: UserLoginDTO) => Promise<IUserTokensReturn | null>;
  updateTokens: (token: string) => Promise<IUserTokensReturn | null>;
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
