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

@injectable()
export class UserController extends Controller implements IUserController {
  constructor(
    @inject(DI_TYPES.LogService) logService: ILogService,
    @inject(DI_TYPES.UserService) private userService: IUserService,
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
    ]);
  }

  register = async ({ body }: Request<{}, {}, UserRegisterDTO>, res: Response): Promise<void> => {
    const createdUser = await this.userService.create(body.name, body.email, body.password);
    if (typeof createdUser == 'string') {
      return this.sendError(res, new Error(createdUser), 500);
    }
    return this.sendSuccess(res, { data: createdUser }, 200);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    return this.sendSuccess(res, { success: 'login' }, 200);
  };
}
