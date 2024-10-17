import { NextFunction, Response } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { ExtendedRequest } from '../types/models';
import { createError, handleError } from './errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import { StoreModel } from '../models/store';
import { regex } from '../helpers/constants';

type EditStoreBody = API_TYPES.Routes['business']['stores']['editStore'];

type EditStoreParams = {
  storeId: string;
};
export const isStoreOwner = async (req: ExtendedRequest<EditStoreBody>, _res: Response, next: NextFunction) => {
  const params = req.params as unknown as EditStoreParams;
  const userId = req.user?._id;
  const { storeId } = params;
  if (!storeId || !userId) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: `Either no user or storeId`,
      publicMessage: 'Ressource not found',
    });
    return next(error);
  }
  const store = await StoreModel.findOne({ _id: storeId, owner: userId }).exec();
  if (!store?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.FORBIDEN,
      message: `User ${userId} is not the owner of the store (${storeId})`,
      publicMessage: 'Please make sure the store exist and you are the owner',
    });
    return next(error);
  }
  req.isStoreOwner = true;
  next();
};

export const getStore = async (req: ExtendedRequest<undefined>, _res: Response, next: NextFunction) => {
  const params = req.params as unknown as EditStoreParams;
  const storeIdMessages: LanguageMessages = {
    'any.required': 'Please provide a storeId',
    'string.pattern.base': 'Please provide a valid storeId',
  };
  const schema = Joi.object<EditStoreParams>({
    storeId: Joi.string().regex(regex.mongoId).required().messages(storeIdMessages),
  });

  const { error, value } = schema.validate(params, { stripUnknown: true });
  if (error) {
    return handleError({ next, error });
  }
  const { storeId } = value;
  if (!storeId) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: `No storeId`,
      publicMessage: 'Ressource not found',
    });
    return next(error);
  }
  const store = await StoreModel.findOne({ _id: storeId }).exec();
  if (!store?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.FORBIDEN,
      message: `No associated store (${storeId}) found`,
      publicMessage: 'Please make sure the store exist',
    });
    return next(error);
  }
  req.storeId = storeId;
  next();
};
