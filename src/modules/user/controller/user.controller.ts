import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../../../common/config/DI.types';
import { Controller } from '../../../common/controller/controller';
import type { ILogService } from '../../../common/log-service/log.service.interface';
import { Request, Response } from 'express';
import { IUserController } from './user.controller.interface';
import { UserRegisterDTO } from '../dto/user.register.dto';
import { UserMiddleware } from '../../../common/middlewares/user/user.middleware';
import { UserLoginDTO } from '../dto/user-login.dto';
import type { IUserService } from '../service/user.service.interface';
import { AuthMiddleware } from '../../../common/middlewares/auth/auth.middleware';
import type { IAuthService } from '../../../common/auth/auth.service.interface';
import { HttpResponses } from '../../../common/types/http-responses.types';
import { UserFavoriteCityDTO } from '../dto/user-favorite-city.dto';
import { UserUpdateDTO } from '../dto/user-update.dto';

@injectable()
export class UserController extends Controller implements IUserController {
  constructor(
    @inject(DI_TYPES.LogService) logService: ILogService,
    @inject(DI_TYPES.UserService) private userService: IUserService,
    @inject(DI_TYPES.AuthService) private authService: IAuthService,
  ) {
    super(logService);
    this.bindRoutes([
      {
        method: 'post',
        path: '/login',
        function: this.login,
        middleware: [new UserMiddleware(UserLoginDTO)],
      },
      {
        method: 'post',
        path: '/register',
        function: this.register,
        middleware: [new UserMiddleware(UserRegisterDTO)],
      },
      {
        method: 'get',
        path: '/info',
        function: this.info,
        middleware: [new AuthMiddleware(this.authService)],
      },
      {
        method: 'post',
        path: '/refresh',
        function: this.refresh,
      },
      {
        method: 'post',
        path: '/update-favorite-cities',
        function: this.updateFavoriteCities,
        middleware: [new AuthMiddleware(this.authService), new UserMiddleware(UserFavoriteCityDTO)],
      },
      {
        method: 'patch',
        path: '/update-user-info',
        function: this.updateUserInfo,
        middleware: [new AuthMiddleware(this.authService), new UserMiddleware(UserUpdateDTO)],
      },
    ]);
  }

  register = async ({ body }: Request<{}, {}, UserRegisterDTO>, res: Response): Promise<void> => {
    const createdUser = await this.userService.create(body.name, body.email, body.password);
    if (typeof createdUser == 'string') {
      return this.sendError(res, new Error(createdUser), HttpResponses.CONFLICT);
    }

    const data = createdUser;

    return this.sendSuccess(res, data, HttpResponses.CREATED);
  };

  login = async ({ body }: Request<{}, {}, UserLoginDTO>, res: Response): Promise<void> => {
    const tokens = await this.userService.validateUser(body);
    if (!tokens)
      return this.sendError(
        res,
        new Error('Неверные данные пользователя'),
        HttpResponses.UNAUTHORIZED,
      );

    return this.sendSuccess(
      res,
      { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
      HttpResponses.OK,
    );
  };

  info = async (req: Request, res: Response): Promise<void> => {
    if (!req.user?.email) {
      return this.sendError(res, new Error('Пользователь не найден'), HttpResponses.NOT_FOUND);
    }

    const userInfo = await this.userService.getUser(req.user.email);

    if (!userInfo) {
      return this.sendError(res, new Error('Пользователь не найден'), HttpResponses.NOT_FOUND);
    }
    return this.sendSuccess(res, { userInfo: userInfo }, HttpResponses.OK);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.headers.authorization) {
        res.status(HttpResponses.FORBIDDEN).json({ error: 'Пользователь не авторизован' });
        return;
      }

      const refreshToken = req.headers.authorization.split(' ')[1];
      if (!refreshToken) {
        res.status(HttpResponses.FORBIDDEN).json({ error: 'Пользователь не авторизован' });
        return;
      }

      const tokens = await this.userService.updateTokens(refreshToken);
      if (!tokens) {
        res.status(HttpResponses.FORBIDDEN).json({ error: 'Пользователь не авторизован' });
        return;
      }

      return this.sendSuccess(
        res,
        { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken },
        HttpResponses.CREATED,
      );
    } catch {
      return this.sendError(res, new Error('Невалидный токен'), HttpResponses.UNAUTHORIZED);
    }
  };

  updateFavoriteCities = async (req: Request, res: Response): Promise<void> => {
    if (!req.body.favoriteCity) {
      this.logService.error(`[UserController]: Нет городов для обновления`);
      return this.sendError(
        res,
        new Error('Город не предоставлен'),
        HttpResponses.UNPROCESSABLE_ENTITY,
      );
    }

    if (!req.user?.id) {
      this.logService.error(`[UserController]: Нет id пользователя`);
      return this.sendError(res, new Error('Пользователь не найден'), HttpResponses.NOT_FOUND);
    }

    try {
      const result = await this.userService.updateFavoriteCities(
        req?.user?.id,
        req.body.favoriteCity,
      );
      if (result) {
        return this.sendSuccess(
          res,
          { message: 'Успешное обновление городов' },
          HttpResponses.CREATED,
        );
      }
    } catch {
      return this.sendError(res, new Error('Ошибка обновления городов'), HttpResponses.BAD_Request);
    }
  };

  updateUserInfo = async (req: Request<{}, {}, UserUpdateDTO>, res: Response): Promise<void> => {
    if (!req.user?.id) {
      this.logService.error(`[UserController]: Нет id пользователя`);
      return this.sendError(res, new Error('Пользователь не найден'), HttpResponses.NOT_FOUND);
    }

    try {
      const result = await this.userService.updateUserInfo(req.user?.id, req.body);
      return this.sendSuccess(res, result, HttpResponses.OK);
    } catch (e) {
      if (e instanceof Error) {
        return this.sendError(res, e, HttpResponses.BAD_Request);
      }
      return this.sendError(
        res,
        new Error('Ошибка в обновление данных пользователя'),
        HttpResponses.BAD_Request,
      );
    }
  };
}
