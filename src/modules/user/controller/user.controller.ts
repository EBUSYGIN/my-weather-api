import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../../../common/config/DI.types';
import { Controller } from '../../../common/controller/controller';
import type { ILogService } from '../../../common/log-service/log.service.interface';
import { Request, Response } from 'express';
import { IUserController } from './user.controller.interface';
import { UserRegisterDTO } from '../dto/user.register.dto';
import { UserMiddleware } from '../../../common/middlewares/user/user.middleware';

@injectable()
export class UserController extends Controller implements IUserController {
  constructor(@inject(DI_TYPES.LogService) logService: ILogService) {
    super(logService);
    this.bindRoutes([
      {
        method: 'post',
        path: '/login',
        function: this.login,
      },
      {
        method: 'post',
        path: '/register',
        function: this.register,
        middleware: [new UserMiddleware(UserRegisterDTO)],
      },
    ]);
  }
  register = async (req: Request<{}, {}, UserRegisterDTO>, res: Response): Promise<void> => {
    return this.sendSuccess(res, { success: 'register' }, 200);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    return this.sendSuccess(res, { success: 'login' }, 200);
  };
}
