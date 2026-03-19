declare global {
  namespace Express {
    export interface Request {
      user?: {
        name: string;
        email: string;
      };
      favoriteCity: string;
    }
  }
}

export {};
