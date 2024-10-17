import { NextFunction, Request, Response } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { regex } from '../helpers/constants';
import { IStoreDocument, IUserDocument } from '../types/models';
import { convertToGenericError, createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import * as storeBusiness from '../business/stores';

interface ExtendedRequest<B> extends Request {
  body: B;
  user?: IUserDocument;
  isStoreOwner?: boolean;
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
    const err = convertToGenericError({ error });
    return next(err);
  }
  const { storeId, error: err } = await storeBusiness.addStore({ ...value.params, ...value.body });
  if (err) {
    return next(err);
  }
  res.status(HTTP_STATUS_CODES.CREATED).json({ storeId });
};

export const getStores = async (req: ExtendedRequest<undefined>, res: Response, next: NextFunction) => {
  const { user } = req;
  if (!user) {
    const err = createError({ statusCode: HTTP_STATUS_CODES.FORBIDEN, message: 'No user associated with the request found' });
    return next(err);
  }
  const { stores } = await storeBusiness.getStores();
  res.status(HTTP_STATUS_CODES.OK).json({ stores });
};

interface DeleteStoreSchema {
  storeId: string;
}
export const deleteStore = async (req: ExtendedRequest<undefined>, res: Response, next: NextFunction) => {
  const params = req.params as unknown as DeleteStoreSchema;

  const storeIdMessages: LanguageMessages = {
    'any.required': 'Please provide a storeId',
    'string.pattern.base': 'Please provide a valid storeId',
  };
  const scheam = Joi.object<DeleteStoreSchema>({
    storeId: Joi.string().regex(regex.mongoId).required().messages(storeIdMessages),
  });
  const { error, value } = scheam.validate(params);
  if (error) {
    const _error = convertToGenericError({ error });
    return next(_error);
  }
  const { error: err } = await storeBusiness.deleteStore({ storeId: value.storeId });
  if (err) {
    return next(err);
  }
  res.status(HTTP_STATUS_CODES.OK).json({});
};

type EditStoreBody = API_TYPES.Routes['business']['stores']['editStore'];
type EditStoreParams = {
  storeId: string;
};
interface EditStoreSchema {
  params: EditStoreParams;
  body: EditStoreBody;
}
export const editStore = async (req: ExtendedRequest<EditStoreBody>, res: Response, next: NextFunction) => {
  const params = req.params as unknown as EditStoreParams;
  const storeIdMessages: LanguageMessages = {
    'string.pattern.base': 'Please provide a valid store id',
  };
  const nameMessages: LanguageMessages = {
    'string.min': 'The field name must have 6 characters mininum',
  };
  const descriptionMessages: LanguageMessages = {
    'string.min': 'The field description must have 12 characters mininum',
    'string.max': 'The field description must have 100 characters maximum',
  };

  const schema = Joi.object<EditStoreSchema>({
    params: {
      storeId: Joi.string().regex(regex.mongoId).required().messages(storeIdMessages),
    },
    body: {
      name: Joi.string().min(6).messages(nameMessages),
      description: Joi.string().min(6).max(100).messages(descriptionMessages),
      active: Joi.bool(),
    },
  });
  const payload = {
    params,
    body: req.body,
  };
  const { error, value } = schema.validate(payload, { abortEarly: true, stripUnknown: true });
  if (error) {
    const err = convertToGenericError({ error });
    return next(err);
  }
  const { error: err } = await storeBusiness.editStore({ storeId: value.params.storeId, body: value.body });
  if (err) {
    return next(err);
  }
  res.status(HTTP_STATUS_CODES.OK).json({});
};
