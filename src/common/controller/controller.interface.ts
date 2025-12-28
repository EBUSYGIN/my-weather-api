import { NextFunction, Request, Response, Router } from 'express';

export interface IController {
  sendSuccess: <T>(res: Response, data: T, code: number) => Promise<void>;
  sendError: (res: Response, error: Error, code: number) => Promise<void>;
}

export interface IRoute {
  method: keyof Pick<Router, 'get' | 'post' | 'put' | 'patch' | 'delete'>;
  function: (req: Request, res: Response, next: NextFunction) => void;
  path: string;
  // middleware?: IMiddleware[];
}
