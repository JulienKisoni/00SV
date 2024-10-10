import { NextFunction, Request, Response } from 'express';
import Joi, { type LanguageMessages } from 'joi';

import type { IUserDocument } from '../types/models';
import * as userBusiness from '../business/users';
import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import { IUserMethods } from 'src/models/user';

type AddUserPayload = Omit<IUserDocument, '_id' | 'storeId' | 'createdAt' | 'updatedAt'>;
interface ExtendedRequest<T> extends Request {
  body: T;
  user?: IUserMethods;
}

export const addUserCtrl = async (req: ExtendedRequest<AddUserPayload>, res: Response, next: NextFunction) => {
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

export const getUsers = async (req: ExtendedRequest<undefined>, res: Response, next: NextFunction) => {
  const { user } = req;
  if (!user) {
    const err = createError({ statusCode: HTTP_STATUS_CODES.FORBIDEN, message: 'No user associated with the request found' });
    return next(err);
  }
  const users = await userBusiness.getUsers();
  res.status(HTTP_STATUS_CODES.OK).json({ users });
};
