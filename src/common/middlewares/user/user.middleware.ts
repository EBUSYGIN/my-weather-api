import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from '../middleware.interface';

export class UserMiddleware implements IMiddleware {
  constructor(private classToValidate: ClassConstructor<object>) {}

  execute = ({ body }: Request, res: Response, next: NextFunction): void => {
    if (!body) {
      res.status(422).send({ message: 'Неправильное тело запроса' });
      return;
    }

    const instance = plainToInstance(this.classToValidate, body);
    validate(instance).then((errors) => {
      if (errors.length) {
        res.status(422).send(errors);
      } else {
        next();
      }
    });
  };
}
