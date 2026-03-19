import { Request, Response } from 'express';

export interface IUserController {
  login: (req: Request, res: Response) => Promise<void>;
  register: (req: Request, res: Response) => Promise<void>;
  info: (req: Request, res: Response) => Promise<void>;
  refresh: (req: Request, res: Response) => Promise<void>;
  updateFavoriteCities: (req: Request, res: Response) => Promise<void>;
}
