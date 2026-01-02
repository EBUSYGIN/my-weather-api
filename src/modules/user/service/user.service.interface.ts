import { User } from '../../../../generated/prisma/client';

export interface IUserService {
  create: (name: string, email: string, password: string) => Promise<Partial<User> | string>;
  getUser: (email: string) => Promise<Partial<User> | null>;
}
