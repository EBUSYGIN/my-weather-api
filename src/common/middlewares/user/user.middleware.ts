import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';
import { IMiddleware } from '../middleware.interface';
import { HttpResponses } from '../../types/http-responses.types';

export class UserMiddleware implements IMiddleware {
  constructor(private classToValidate: ClassConstructor<object>) {}

  execute = ({ body }: Request, res: Response, next: NextFunction): void => {
    if (!body) {
      res.status(HttpResponses.UNPROCESSABLE_ENTITY).send({ message: 'Неправильное тело запроса' });
      return;
    }

    const instance = plainToInstance(this.classToValidate, body);
    validate(instance).then((errors) => {
      if (errors.length) {
        res.status(HttpResponses.UNPROCESSABLE_ENTITY).send(errors);
      } else {
        next();
      }
    });
  };
}
