import { inject, injectable } from 'inversify';
import type { ILogService } from '../log-service/log.service.interface';
import { DI_TYPES } from '../config/DI.types';
import type { IEnvService } from '../env-service/env.service.interface';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { IDatabaseService } from './database-service.interface';

@injectable()
export class DatabaseService implements IDatabaseService {
  prisma: PrismaClient;

  constructor(
    @inject(DI_TYPES.LogService) private logService: ILogService,
    @inject(DI_TYPES.EnvService) private envService: IEnvService,
  ) {
    const connectionString = this.envService.get('DATABASE_URL');
    if (!connectionString) {
      this.logService.error(
        'Невозможно инициализировать подключение к бд из-за отсутствия DATABASE_URL',
      );
      throw new Error('Невозможно инициализировать подключение к бд из-за отсутствия DATABASE_URL');
    }

    const adapter = new PrismaPg({ connectionString });
    this.prisma = new PrismaClient({ adapter });
  }

  connect = async (): Promise<void> => {
    try {
      await this.prisma.$connect();
      this.logService.log('Успешное подключение к бд');
    } catch {
      this.logService.error('Ошибка подключения к бд');
    }
  };

  disconnect = async (): Promise<void> => {
    await this.prisma.$disconnect();
  };
}
