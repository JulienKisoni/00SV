import { NextFunction, Request, Response } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { regex } from '../helpers/constants';
import { IStoreDocument } from '../types/models';
import { convertToGenericError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import * as storeBusiness from '../business/stores';

interface ExtendedRequest<B> extends Request {
  body: B;
}

type AddStoreBody = Pick<IStoreDocument, 'name' | 'description' | 'active'>;
interface AddStoreJoiSchema {
  params: {
    userId: string;
  };
  body: AddStoreBody;
}
export const addStore = async (req: ExtendedRequest<AddStoreBody>, res: Response, next: NextFunction) => {
  const { userId } = req.params;
  const userIdMessages: LanguageMessages = {
    'any.required': 'Please provide a user id',
    'string.pattern.base': 'Please provide a valid user id',
  };
  const nameMessages: LanguageMessages = {
    'any.required': 'Please provide a store name',
    'string.min': 'The field name must have 6 characters mininum',
  };
  const descriptionMessages: LanguageMessages = {
    'any.required': 'Please provide a store description',
    'string.min': 'The field description must have 12 characters mininum',
    'string.max': 'The field description must have 100 characters maximum',
  };
  const activeMessages: LanguageMessages = {
    'any.required': 'The field active is required',
  };
  const payload: AddStoreJoiSchema = {
    params: {
      userId,
    },
    body: req.body,
  };
  const schema = Joi.object<AddStoreJoiSchema>({
    params: {
      userId: Joi.string().regex(regex.mongoId).required().messages(userIdMessages),
    },
    body: {
      name: Joi.string().min(6).required().messages(nameMessages),
      description: Joi.string().min(6).max(100).required().messages(descriptionMessages),
      active: Joi.bool().required().messages(activeMessages),
    },
  });
  const { error, value } = schema.validate(payload, { stripUnknown: true, abortEarly: true });
  if (error) {
    const err = convertToGenericError({ statusCode: HTTP_STATUS_CODES.BAD_REQUEST, error });
    return next(err);
  }
  const { storeId, error: err } = await storeBusiness.addStore({ ...value.params, ...value.body });
  if (err) {
    return next(err);
  }
  res.status(HTTP_STATUS_CODES.CREATED).json({ storeId });
};
