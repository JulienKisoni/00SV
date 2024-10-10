import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

import { createError } from '../middlewares/errors';
import * as authBusiness from '../business/auth';
import { HTTP_STATUS_CODES } from '../types/enums';

export const loginCtrl = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const emmailMessages: Joi.LanguageMessages = {
    'string.email': 'Please enter a valid email',
    'any.required': 'The email field is required',
  };
  const passwordMessages: Joi.LanguageMessages = {
    'any.required': 'The password field is required',
    'string.min': 'The password field must have 6 characters at least',
  };
  const schema = Joi.object<API_TYPES.Routes['body']['login']>({
    email: Joi.string().email().required().messages(emmailMessages),
    password: Joi.string().min(6).required().messages(passwordMessages),
  });

  const { error, value } = schema.validate({ email, password }, { stripUnknown: true, abortEarly: true });

  if (error) {
    const err = createError({ statusCode: HTTP_STATUS_CODES.BAD_REQUEST, publicMessage: error.message, message: error.message });
    return next(err);
  } else if (value) {
    const { error, tokens } = await authBusiness.login(value);
    if (error) {
      return next(error);
    }
    res.status(HTTP_STATUS_CODES.OK).json(tokens);
  }
};
