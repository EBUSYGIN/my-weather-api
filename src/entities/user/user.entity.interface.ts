export interface IUserEntity {
  setPassword: (password: string, salt: number) => void;
}
