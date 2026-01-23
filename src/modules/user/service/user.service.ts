import { inject, injectable } from 'inversify';
import { DI_TYPES } from '../../../common/config/DI.types';
import type { ILogService } from '../../../common/log-service/log.service.interface';
import { IUserRegister, IUserService, IUserTokensReturn } from './user.service.interface';
import type { IDatabaseService } from '../../../common/database-service/database-service.interface';
import { UserEntity } from '../../../entities/user/user.entity';
import type { IEnvService } from '../../../common/env-service/env.service.interface';
import { User } from '../../../../generated/prisma/client';
import type { IAuthService } from '../../../common/auth/auth.service.interface';
import { UserLoginDTO } from '../dto/user-login.dto';

@injectable()
export class UserService implements IUserService {
  private salt: number;
  constructor(
    @inject(DI_TYPES.LogService) private logService: ILogService,
    @inject(DI_TYPES.DatabaseService) private databaseService: IDatabaseService,
    @inject(DI_TYPES.EnvService) private envService: IEnvService,
    @inject(DI_TYPES.AuthService) private authService: IAuthService,
  ) {
    const parsedValue = this.envService.get('SALT');
    if (!parsedValue) {
      this.logService.error('[UserService] отсутствует соль для хеширования');
      throw new Error('Отсутствует соль для хеширования');
    }
    this.salt = Number.parseInt(parsedValue);
  }

  create = async (
    name: string,
    email: string,
    password: string,
  ): Promise<IUserRegister | string> => {
    const existingUser = await this.databaseService.prisma.user.findFirst({
      where: {
        email: email,
      },
    });
    if (existingUser) return 'Пользователь уже существует';

    const user = new UserEntity(name, email);
    await user.setPassword(password, this.salt);
    const accessToken = this.authService.signAccessToken({ name, email });
    const refreshToken = this.authService.signRefreshToken({ email });
    try {
      const createdUser = await this.databaseService.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
          refreshTokens: {
            create: [{ token: refreshToken }],
          },
        },
        omit: {
          password: true,
        },
      });
      this.logService.log(
        `[UserService]: успешное создание пользователя Имя: ${name} Почта: ${email}`,
      );
      return { user: createdUser, accessToken, refreshToken };
    } catch {
      this.logService.log(`[UserService]: ошибка создания пользователя`);
      return 'Ошибка создания пользователя';
    }
  };

  validateUser = async ({ email, password }: UserLoginDTO): Promise<IUserTokensReturn | null> => {
    const existingUser = await this.databaseService.prisma.user.findFirst({ where: { email } });
    if (!existingUser) return null;

    const user = new UserEntity(existingUser.name, existingUser.email, existingUser.password);
    const isVerified = await user.verifyUser(password);
    if (!isVerified) return null;

    const accessToken = this.authService.signAccessToken({
      email: existingUser.email,
      name: existingUser.name,
    });
    const refreshToken = this.authService.signRefreshToken({ email: existingUser.email });
    return { accessToken, refreshToken };
  };

  getUser = async (email: string): Promise<Partial<User> | null> => {
    return this.databaseService.prisma.user.findFirst({
      where: { email },
      omit: { password: true },
    });
  };

  updateTokens = async (token: string): Promise<IUserTokensReturn | null> => {
    try {
      const payload = this.authService.verifyRefreshToken(token);
      const result = await this.databaseService.prisma.refreshToken.findFirst({
        where: {
          user: {
            email: payload.email,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

      if (!result || result.isRevoked) return null;

      const accessToken = this.authService.signAccessToken({
        email: result.user.email,
        name: result.user.name,
      });
      const refreshToken = this.authService.signRefreshToken({ email: result.user.email });

      await this.databaseService.prisma.refreshToken.update({
        where: {
          id: result.id,
        },
        data: {
          token: refreshToken,
        },
      });

      return { accessToken, refreshToken };
    } catch {
      return null;
    }
  };
}
