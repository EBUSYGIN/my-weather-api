import { hash } from 'bcryptjs';
import { injectable } from 'inversify';
import { IUserEntity } from './user.entity.interface';

@injectable()
export class UserEntity implements IUserEntity {
  private _password: string;
  private _name: string;
  private _email: string;

  constructor(name: string, email: string) {
    this._email = email;
    this._name = name;
  }

  setPassword = async (password: string, salt: number): Promise<void> => {
    if (!salt) throw new Error('Отсутствует соль для хеширования');
    this._password = await hash(password, salt);
  };

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get password(): string {
    return this._password;
  }
}
