import { PrismaClient } from '../../../generated/prisma/client';

export interface IDatabaseService {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  prisma: PrismaClient;
}
