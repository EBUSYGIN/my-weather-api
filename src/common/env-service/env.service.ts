import { inject, injectable } from 'inversify';
import { config, DotenvConfigOutput, DotenvParseOutput } from 'dotenv';
import { IEnvService } from './env.service.interface';
import { DI_TYPES } from '../config/DI.types';
import type { ILogService } from '../log-service/log.service.interface';

@injectable()
export class EnvService implements IEnvService {
  private config: DotenvParseOutput;

  constructor(@inject(DI_TYPES.LogService) private logService: ILogService) {
    const parsedEnvFile: DotenvConfigOutput = config();

    if (parsedEnvFile.error) {
      this.logService.error('Ошибка загрузки env файла');
    } else {
      this.logService.log('Env файл успешно загружен');
      this.config = parsedEnvFile.parsed as DotenvParseOutput;
    }
  }

  get = (key: string): string | undefined => {
    return this.config[key];
  };

  getPort = (): number | undefined => {
    return Number.parseInt(this.config['PORT'] || '');
  };
}
