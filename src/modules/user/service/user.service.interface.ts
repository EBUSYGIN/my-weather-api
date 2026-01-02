import { User } from '../../../../generated/prisma/client';
import { UserLoginDTO } from '../dto/user-login.dto';

export interface IUserService {
  create: (name: string, email: string, password: string) => Promise<Partial<User> | string>;
  getUser: (email: string) => Promise<Partial<User> | null>;
  validateUser: (body: UserLoginDTO) => Promise<IUserTokensReturn | null>;
}

export interface IUserTokensReturn {
  accessToken: string;
  refreshToken: string;
}
