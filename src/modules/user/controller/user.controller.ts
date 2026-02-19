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
    ]);
  }

  register = async ({ body }: Request<{}, {}, UserRegisterDTO>, res: Response): Promise<void> => {
    const createdUser = await this.userService.create(body.name, body.email, body.password);
    if (typeof createdUser == 'string') {
      return this.sendError(res, new Error(createdUser), HttpResponses.CONFLICT);
    }

    const { refreshToken, accessToken, ...data } = createdUser;


    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/users/refresh',
    });


    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    })


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
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/users/refresh',
    });

     res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/',
    })

    return this.sendSuccess(res, {success: true}, HttpResponses.OK);


  };

  info = async (req: Request, res: Response): Promise<void> => {
    const userInfo = await this.userService.getUser(req.body.email);
    if (!userInfo)
      return this.sendError(res, new Error('Пользователь не найден'), HttpResponses.NOT_FOUND);
    return this.sendSuccess(res, { userInfo: userInfo }, HttpResponses.OK);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken)
        return this.sendError(res, new Error('Невалидный токен'), HttpResponses.UNAUTHORIZED);
      const tokens = await this.userService.updateTokens(refreshToken);
      if (!tokens)
        return this.sendError(res, new Error('Невалидный токен'), HttpResponses.UNAUTHORIZED);
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/users/refresh',
      });
      return this.sendSuccess(res, { accessToken: tokens.accessToken }, HttpResponses.CREATED);
    } catch {
      return this.sendError(res, new Error('Невалидный токен'), HttpResponses.UNAUTHORIZED);
    }
  };
}
