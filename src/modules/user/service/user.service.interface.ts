import { UserModel } from '../../../../generated/prisma/models';

export interface IUserService {
  create: (name: string, email: string, password: string) => Promise<UserModel | string>;
}
