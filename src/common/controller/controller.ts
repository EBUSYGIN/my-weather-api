import { Response, Router } from 'express';
import { IController, IRoute } from './controller.interface';
import { DI_TYPES } from '../config/DI.types';
import type { ILogService } from '../log-service/log.service.interface';
import { inject } from 'inversify';

export abstract class Controller implements IController {
  private _router: Router;

  constructor(@inject(DI_TYPES.LogService) private logService: ILogService) {
    this._router = Router();
  }

  get router(): Router {
    return this._router;
  }

  sendSuccess = async <T>(res: Response, data: T, code: number): Promise<void> => {
    res.status(code).json(data);
    return;
  };

  sendError = async (res: Response, error: Error, code: number): Promise<void> => {
    res.status(code).json({ error });
    return;
  };

  protected bindRoutes = (routes: IRoute[]): void => {
    for (const route of routes) {
      this.logService.log(`[${route.method}] ${route.path}`);
      this._router[route.method](route.path, route.function);
    }
  };
}
