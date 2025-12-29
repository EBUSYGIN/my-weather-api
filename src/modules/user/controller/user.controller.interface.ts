import { Request, Response } from 'express';

export interface IUserController {
  login: (req: Request, res: Response) => Promise<void>;
  register: (req: Request, res: Response) => Promise<void>;
}
