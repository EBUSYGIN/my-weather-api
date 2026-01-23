import { JwtPayload } from 'jsonwebtoken';

export interface IAuthService {
  signAccessToken: (payload: IAccessTokenPayload) => string;
  verifyAccessToken: (accessToken: string) => boolean;
  signRefreshToken: (payload: IRefreshTokenPayload) => string;
  verifyRefreshToken: (refreshToken: string) => JwtPayload;
}

export interface IAccessTokenPayload {
  email: string;
  name: string;
}

export interface IRefreshTokenPayload {
  email: string;
}
