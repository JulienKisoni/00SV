import { NextFunction, Request, Response } from 'express';
import Joi, { type LanguageMessages } from 'joi';

import { IUserDocument, USER_ROLES } from '../types/models';
import * as userBusiness from '../business/users';
import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import { IUserMethods } from '../models/user';
import { regex } from '../helpers/constants';
interface AddUserPayload extends Omit<IUserDocument, '_id' | 'storeId' | 'createdAt' | 'updatedAt'> {
  role: USER_ROLES;
}
interface ExtendedRequest<B> extends Request {
  body: B;
  user?: IUserMethods;
  tokenId?: string;
}

export const addUserCtrl = async (req: ExtendedRequest<AddUserPayload>, res: Response, next: NextFunction) => {
  const { email, password, username, role } = req.body;

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
  const roleMessages: LanguageMessages = {
    'any.required': 'The field role is required',
    'any.only': 'Please enter a valid role',
  };

  const schema = Joi.object<AddUserPayload>({
    username: Joi.string().min(6).required().messages(usernameMessages),
    email: Joi.string().email().required().messages(emailMessages),
    password: Joi.string().min(6).required().messages(passwordMessages),
    role: Joi.string().valid(USER_ROLES.admin, USER_ROLES.user).required().messages(roleMessages),
  });
  const { error, value } = schema.validate({ email, password, username, role });
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

export const invalidateToken = async (req: ExtendedRequest<{ userId: string }>, res: Response, next: NextFunction) => {
  const messages: LanguageMessages = {
    'any.required': 'Please provide a user id',
    'string.pattern.base': 'Please provide a valid user id',
  };
  const schema = Joi.object<{ userId: string }>({
    userId: Joi.string().regex(regex.mongoId).required().messages(messages),
  });
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) {
    const err = createError({ statusCode: HTTP_STATUS_CODES.FORBIDEN, message: error.message, publicMessage: error.message });
    return next(err);
  }
  await userBusiness.invalidateToken({ userId: value.userId });
  res.status(HTTP_STATUS_CODES.OK).json({});
};

export const deleteUser = async (req: ExtendedRequest<undefined>, res: Response, next: NextFunction) => {
  const messages: LanguageMessages = {
    'any.required': 'Please provide a user id',
    'string.pattern.base': 'Please provide a valid user id',
  };
  const schema = Joi.object<{ userId: string }>({
    userId: Joi.string().regex(regex.mongoId).required().messages(messages),
  });
  const { error, value } = schema.validate(req.params, { stripUnknown: true });
  if (error) {
    const err = createError({ statusCode: HTTP_STATUS_CODES.BAD_REQUEST, message: error.message, publicMessage: error.message });
    return next(err);
  }
  await userBusiness.deleteOne({ userId: value.userId });
  res.status(HTTP_STATUS_CODES.OK).json({});
};
