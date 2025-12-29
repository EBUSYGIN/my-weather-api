import { inject } from 'inversify';
import express, { Express } from 'express';
import { DI_TYPES } from './common/config/DI.types';
import type { ILogService } from './common/log-service/log.service.interface';
import type { IEnvService } from './common/env-service/env.service.interface';
import type { IDatabaseService } from './common/database-service/database-service.interface';
import { Server } from 'http';
import { UserController } from './modules/user/controller/user.controller';

export class App {
  private port: number;
  private app: Express;
  private server: Server;

  constructor(
    @inject(DI_TYPES.LogService) private logService: ILogService,
    @inject(DI_TYPES.EnvService) private envService: IEnvService,
    @inject(DI_TYPES.DatabaseService) private databaseService: IDatabaseService,
    @inject(DI_TYPES.UserController) private userController: UserController,
  ) {
    this.port = this.envService.getPort() || 3000;
    this.app = express();
  }

  useJsonParser = (): void => {
    this.app.use(express.json());
  };

  useRoutes = (): void => {
    this.app.use('/users', this.userController.router);
  };

  init = async (): Promise<void> => {
    await this.databaseService.connect();

    this.useJsonParser();
    this.useRoutes();

    this.logService.log(`Сервер запущен на порту ${this.port}`);
    this.server = this.app.listen(this.port);
  };
}
