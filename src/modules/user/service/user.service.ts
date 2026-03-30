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
import { UserModel } from '../../../../generated/prisma/models';
import { UserUpdateDTO } from '../dto/user-update.dto';

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

    try {
      const createdUser = await this.databaseService.prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: user.password,
        },
        omit: {
          password: true,
        },
      });

      const accessToken = this.authService.signAccessToken({ name, email, id: createdUser.id });
      const refreshToken = this.authService.signRefreshToken({ email, id: createdUser.id });

      await this.databaseService.prisma.refreshToken.create({
        data: { token: refreshToken, userId: createdUser.id },
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
      id: existingUser.id,
    });
    const refreshToken = this.authService.signRefreshToken({
      email: existingUser.email,
      id: existingUser.id,
    });
    return { accessToken, refreshToken };
  };

  getUser = async (email: string): Promise<Partial<User> | null> => {
    return this.databaseService.prisma.user.findFirst({
      where: { email },
      omit: { password: true },
      include: { favoriteCities: true },
    });
  };

  updateTokens = async (token: string): Promise<IUserTokensReturn | null> => {
    try {
      const payload = this.authService.verifyRefreshToken(token);
      const result = await this.databaseService.prisma.refreshToken.findFirst({
        where: {
          user: {
            id: payload.id,
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
        id: result.user.id,
      });
      const refreshToken = this.authService.signRefreshToken({
        email: result.user.email,
        id: result.user.id,
      });

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

  updateFavoriteCities = async (id: string, favoriteCity: string): Promise<boolean> => {
    try {
      const user = await this.databaseService.prisma.user.findFirst({
        where: { id },
        include: { favoriteCities: true },
      });
      if (!user) {
        this.logService.error(`[UserService]: ошибка при поиске пользователя с email: ${id}`);
        throw new Error('Ошибка в поиске пользователя');
      }

      const existing = await this.databaseService.prisma.favoriteCity.findUnique({
        where: {
          userId_cityName: {
            userId: user.id,
            cityName: favoriteCity,
          },
        },
      });

      if (existing) {
        await this.databaseService.prisma.favoriteCity.delete({
          where: {
            userId_cityName: {
              userId: user.id,
              cityName: favoriteCity,
            },
          },
        });
        this.logService.log(
          `[UserService]: успешное удаление города [${favoriteCity}] для пользователя: ${id}`,
        );
      } else {
        await this.databaseService.prisma.favoriteCity.create({
          data: {
            userId: user.id,
            cityName: favoriteCity,
          },
        });
        this.logService.log(
          `[UserService]: успешное добавление города [${favoriteCity}] для пользователя: ${id}`,
        );
      }

      return true;
    } catch (e) {
      this.logService.error(
        `[UserService]: ошибка при обновление списка города для пользователя с email: ${id}`,
        e,
      );
      if (e instanceof Error) {
        throw e;
      }
      throw new Error('Ошибка при обновление городов');
    }
  };

  updateUserInfo = async (id: string, body: UserUpdateDTO): Promise<Partial<UserModel>> => {
    try {
      const existingUser = await this.databaseService.prisma.user.findFirst({ where: { id } });
      if (!existingUser) {
        this.logService.error(`[UserService]: ошибка при поиске пользователя с email: ${id}`);
        throw new Error('Пользователь не найдет');
      }

      if (existingUser.email == body.newEmail) {
        throw new Error('Email совпадает');
      }

      const updatedUser = await this.databaseService.prisma.user.update({
        where: { id },
        data: {
          ...(body.newEmail !== undefined && { email: body.newEmail }),
          ...(body.name !== undefined && { name: body.name }),
          ...(body.photoId !== undefined && { photoId: body.photoId }),
        },
        include: { favoriteCities: true },
        omit: { password: true },
      });

      return updatedUser;
    } catch (e) {
      this.logService.error(`[UserService]: ошибка при пользователя с email: ${id}`);
      if (e instanceof Error) {
        throw e;
      }
      throw new Error('Ошибка при обновление пользователя');
    }
  };
}
