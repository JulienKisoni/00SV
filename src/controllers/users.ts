import { NextFunction, Request, Response } from 'express';
import Joi, { type LanguageMessages } from 'joi';

import type { User } from '../types/models';
import * as userBusiness from '../business/users';
import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';

type AddUserPayload = Omit<User, '_id' | 'storeId' | 'createdAt' | 'updatedAt'>;
interface AddUserRequest<T> extends Request {
  body: T;
}

export const addUserCtrl = async (req: AddUserRequest<AddUserPayload>, res: Response, next: NextFunction) => {
  const { email, password, username } = req.body;

  const usernameMessages: LanguageMessages = {
    'any.required': 'The field username is required',
    'string.min': 'The field username must have 6 characters mininum',
  };
  const passwordMessages: LanguageMessages = {
    'any.required': 'The field password is required',
    'string.min': 'The field password must have 6 characters mininum',
  };
  const emailMessages: LanguageMessages = {
    'any.required': 'The field email is required',
    'string.email': 'Please enter a valid email',
  };

  const schema = Joi.object<AddUserPayload>({
    username: Joi.string().min(6).required().messages(usernameMessages),
    email: Joi.string().email().required().messages(emailMessages),
    password: Joi.string().min(6).required().messages(passwordMessages),
  });
  const { error, value } = schema.validate({ email, password, username });
  if (error) {
    const err = createError({ statusCode: HTTP_STATUS_CODES.BAD_REQUEST, message: error.message, publicMessage: error.message });
    return next(err);
  } else if (value) {
    const { error, userId } = await userBusiness.addUser(value);
    if (error && !userId) {
      return next(error);
    }
    res.status(HTTP_STATUS_CODES.CREATED).json({ userId });
  }
};
