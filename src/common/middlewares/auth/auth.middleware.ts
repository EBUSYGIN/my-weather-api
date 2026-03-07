import type { IAuthService } from '../../auth/auth.service.interface';
import { HttpResponses } from '../../types/http-responses.types';
import { IMiddleware } from '../middleware.interface';
import { Response, NextFunction, Request } from 'express';

export class AuthMiddleware implements IMiddleware {
  constructor(private authService: IAuthService) {}

  execute = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.headers.authorization) {
      res.status(HttpResponses.FORBIDDEN).json({ error: 'Пользователь не авторизован' });
      return;
    }

    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      res.status(HttpResponses.FORBIDDEN).json({ error: 'Пользователь не авторизован' });
      return;
    }

    const payload = this.authService.verifyAccessToken(token);
    if (!payload) {
      res.status(HttpResponses.FORBIDDEN).json({ error: 'Пользователь не авторизован' });
      return;
    }

    req.user = { email: payload.email, name: payload.name };
    next();
  };
}
