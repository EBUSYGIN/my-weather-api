import { inject } from 'inversify';
import { DI_TYPES } from './common/config/DI.types';
import type { ILogService } from './common/log-service/log.service.interface';
import type { IEnvService } from './common/env-service/env.service.interface';

export class App {
  private port: number;

  constructor(
    @inject(DI_TYPES.LogService) private logService: ILogService,
    @inject(DI_TYPES.EnvService) private envService: IEnvService,
  ) {
    this.port = this.envService.getPort() || 3000;
  }

  async init(): Promise<void> {
    this.logService.log('Сервер запущен');
  }
}
