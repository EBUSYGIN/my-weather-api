declare global {
  namespace Express {
    export interface Request {
      user?: {
        name: string;
        email: string;
        id: string;
      };
      favoriteCity: string;
    }
  }
}

export {};
