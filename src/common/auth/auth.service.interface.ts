import { User } from '../../../generated/prisma/client';

export interface IAuthService {
  singAccessToken: (payload: Pick<User, 'email' | 'name'>) => string;
  verifyAccessToken: (accessToken: string) => boolean;
  signRefreshToken: (payload: Pick<User, 'email'>) => string;
  verifyRefreshToken: (refreshToken: string) => boolean;
}
