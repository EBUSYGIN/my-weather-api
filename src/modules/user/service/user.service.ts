import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../../../common/config/DI.types';
import type { ILogService } from '../../../common/log-service/log.service.interface';
import { IUserService } from './user.service.interface';
import type { IDatabaseService } from '../../../common/database-service/database-service.interface';
import { UserEntity } from '../../../entities/user/user.entity';
import type { IEnvService } from '../../../common/env-service/env.service.interface';
import { User } from '../../../../generated/prisma/client';

@injectable()
export class UserService implements IUserService {
  constructor(
    @inject(DI_TYPES.LogService) private logService: ILogService,
    @inject(DI_TYPES.DatabaseService) private databaseService: IDatabaseService,
    @inject(DI_TYPES.EnvService) private envService: IEnvService,
  ) {}

  create = async (name: string, email: string, password: string): Promise<User | string> => {
    const parsedValue = this.envService.get('SALT');
    if (!parsedValue) throw new Error('Отсутствует соль для хеширования');

    const existingUser = await this.databaseService.prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (existingUser) return 'Пользователь уже существует';

    const salt = Number.parseInt(parsedValue);
    const user = new UserEntity(name, email);
    await user.setPassword(password, salt);
    try {
      const createdUser = await this.databaseService.prisma.user.create({
        data: { name: user.name, email: user.email, password: user.password },
      });
      this.logService.log(`[UserService]: успешное создание пользователя`);
      return createdUser;
    } catch {
      this.logService.log(`[UserService]: ошибка создания пользователя`);
      return 'Ошибка создания пользователя';
    }
  };
}
