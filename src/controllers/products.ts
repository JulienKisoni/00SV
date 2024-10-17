import { Response, NextFunction, Request } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { ExtendedRequest } from '../types/models';
import { regex } from '../helpers/constants';
import { createError, handleError } from '../middlewares/errors';
import * as productBusiness from '../business/products';
import { HTTP_STATUS_CODES } from '../types/enums';

type AddProductBody = API_TYPES.Routes['business']['products']['add']['body'];
type AddProductParams = Pick<API_TYPES.Routes['business']['products']['add'], 'storeId'>;
interface AddProductSchema {
  params: AddProductParams;
  body: AddProductBody;
}
export const addProduct = async (req: ExtendedRequest<AddProductBody>, res: Response, next: NextFunction) => {
  const params = req.params as unknown as AddProductParams;

  const storeIdMessages: LanguageMessages = {
    'any.required': 'Please provide a storeId',
    'string.pattern.base': 'Please provide a valid storeId',
  };
  const nameMessages: LanguageMessages = {
    'any.required': 'Please provide a store name',
  };
  const descriptionMessages: LanguageMessages = {
    'any.required': 'Please provide a store description',
    'string.min': 'The field description must have 12 characters mininum',
    'string.max': 'The field description must have 100 characters maximum',
  };
  const activeMessages: LanguageMessages = {
    'any.required': 'The field active is required',
  };
  const qtyMessages: LanguageMessages = {
    'any.required': 'The field quantity is required',
  };
  const minQtyMessages: LanguageMessages = {
    'any.required': 'The field minQuantity is required',
  };
  const unitPriceMessages: LanguageMessages = {
    'any.required': 'The field unitPrice is required',
  };

  const schema = Joi.object<AddProductSchema>({
    params: {
      storeId: Joi.string().regex(regex.mongoId).required().messages(storeIdMessages),
    },
    body: {
      name: Joi.string().required().messages(nameMessages),
      quantity: Joi.number().required().messages(qtyMessages),
      description: Joi.string().min(12).max(100).required().messages(descriptionMessages),
      minQuantity: Joi.number().required().messages(minQtyMessages),
      active: Joi.bool().required().messages(activeMessages),
      unitPrice: Joi.number().required().messages(unitPriceMessages),
    },
  });

  const payload: AddProductSchema = {
    params,
    body: req.body,
  };

  const { error, value } = schema.validate(payload, { stripUnknown: true });
  if (error) {
    return handleError({ error, next });
  }
  const owner = req.user?._id?.toString() || '';
  const { error: _error, data } = await productBusiness.addProduct({ owner, storeId: value.params.storeId, body: value.body });
  if (_error) {
    return handleError({ error: _error, next });
  }
  res.status(HTTP_STATUS_CODES.OK).json(data);
};

export const getAllProducts = async (_req: Request, res: Response, _next: NextFunction) => {
  const { products } = await productBusiness.gettAllProducts();
  res.status(HTTP_STATUS_CODES.OK).json({ products });
};

type GetStoreProductsPayload = API_TYPES.Routes['business']['products']['getByStoreId'];
export const getStoreProducts = async (req: ExtendedRequest<undefined>, res: Response, next: NextFunction) => {
  const { storeId } = req;
  if (!storeId) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `No store id (${storeId})`,
      publicMessage: 'The store does not exist',
    });
    return next(error);
  }

  const storeIdMessages: LanguageMessages = {
    'any.required': 'Please provide a storeId',
    'string.pattern.base': 'Please provide a valid storeId',
  };
  const schema = Joi.object<GetStoreProductsPayload>({
    storeId: Joi.string().regex(regex.mongoId).required().messages(storeIdMessages),
  });

  const { error, value } = schema.validate({ storeId }, { stripUnknown: true });
  if (error) {
    return handleError({ error, next });
  }

  const { products } = await productBusiness.getStoreProducts({ storeId: value.storeId });

  res.status(HTTP_STATUS_CODES.OK).json({ products });
};

export const deleteOne = async (req: ExtendedRequest<undefined>, res: Response, next: NextFunction) => {
  const { storeId, productId } = req;

  if (!storeId || !productId) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: `Missing either store id or product id`,
      publicMessage: 'Bad request',
    });
    return next(error);
  }

  const { error } = await productBusiness.deleteOne({ storeId, productId });
  if (error) {
    return handleError({ error, next });
  }
  res.status(HTTP_STATUS_CODES.OK).json({});
};
