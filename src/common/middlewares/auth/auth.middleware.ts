import type { IAuthService } from '../../auth/auth.service.interface';
import { HttpResponses } from '../../types/http-responses.types';
import { IMiddleware } from '../middleware.interface';
import { Response, NextFunction, Request } from 'express';

export class AuthMiddleware implements IMiddleware {
  constructor(private authService: IAuthService) {}

  execute = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const accessToken = req.cookies?.accessToken;

      if (!accessToken) {
        res.status(HttpResponses.FORBIDDEN).json({ error: 'Пользователь не авторизован' });
        return;
      }

      const payload = this.authService.verifyAccessToken(accessToken);
      if (!payload) {
        res.status(HttpResponses.FORBIDDEN).json({ error: 'Пользователь не авторизован' });
        return;
      }

      req.user = { email: payload.email, name: payload.name };
      next();
    } catch (e) {
      if (e instanceof Error) {
        res.status(HttpResponses.FORBIDDEN).json({ error: e.message });
      } else {
        res.status(HttpResponses.FORBIDDEN).json({ error: 'Ошибка' });
      }
    }
  };
}
