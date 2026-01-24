import { inject, injectable } from 'inversify';
import { IAccessTokenPayload, IAuthService, IRefreshTokenPayload } from './auth.service.interface';
import { DI_TYPES } from '../config/DI.types';
import type { IEnvService } from '../env-service/env.service.interface';
import type { ILogService } from '../log-service/log.service.interface';
import jwt, { JwtPayload } from 'jsonwebtoken';

@injectable()
export class AuthService implements IAuthService {
  accessSecret: string;
  refreshSecret: string;

  constructor(
    @inject(DI_TYPES.EnvService) private envService: IEnvService,
    @inject(DI_TYPES.LogService) private logService: ILogService,
  ) {
    const accessSecret = this.envService.get('ACCESS_SECRET');
    const refreshSecret = this.envService.get('REFRESH_SECRET');
    if (!accessSecret || !refreshSecret) {
      this.logService.error('[AuthService] ошибка в получение секретов');
      throw new Error('Ошибка получения секретов');
    } else {
      this.accessSecret = accessSecret;
      this.refreshSecret = refreshSecret;
    }
  }

  signAccessToken = (payload: IAccessTokenPayload): string => {
    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: '15m',
      algorithm: 'HS512',
    });
    return accessToken;
  };

  verifyAccessToken = (accessToken: string): boolean => {
    try {
      jwt.verify(accessToken, this.accessSecret, { algorithms: ['HS512'] });
      return true;
    } catch {
      this.logService.error('[AuthService] : Ошибка проверки access token');
      return false;
    }
  };

  signRefreshToken = (payload: IRefreshTokenPayload): string => {
    return jwt.sign(payload, this.refreshSecret, { expiresIn: '7d', algorithm: 'HS384' });
  };

  verifyRefreshToken = (refreshToken: string): JwtPayload => {
    try {
      return jwt.verify(refreshToken, this.refreshSecret, { algorithms: ['HS384'] }) as JwtPayload;
    } catch (e) {
      this.logService.error('[AuthService] : Ошибка проверки refresh token');
      throw e;
    }
  };
}
