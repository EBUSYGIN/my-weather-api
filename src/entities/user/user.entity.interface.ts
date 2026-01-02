export interface IUserEntity {
  setPassword: (password: string, salt: number) => void;
  verifyUser: (hash: string) => Promise<boolean>;
}
