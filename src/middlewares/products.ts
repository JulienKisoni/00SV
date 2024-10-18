import { NextFunction, Response } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { HTTP_STATUS_CODES } from '../types/enums';
import { ExtendedRequest } from '../types/models';
import { createError, handleError } from './errors';
import { regex } from '../helpers/constants';
import { ProductModel } from '../models/product';

type DeleteProductParams = API_TYPES.Routes['params']['products']['deleteOne'];
interface DeleteProductSchema {
  params: DeleteProductParams;
}
export const isProductOwner = async (req: ExtendedRequest<undefined>, _res: Response, next: NextFunction) => {
  const params = req.params as unknown as DeleteProductParams;
  const userId = req.user?._id;
  const storeIdMessages: LanguageMessages = {
    'string.pattern.base': 'Please provide a valid storeId',
  };
  const productIdMessages: LanguageMessages = {
    'any.required': 'Please provide a productId',
    'string.pattern.base': 'Please provide a valid productId',
  };
  const schema = Joi.object<DeleteProductSchema>({
    params: {
      storeId: Joi.string().regex(regex.mongoId).messages(storeIdMessages),
      productId: Joi.string().regex(regex.mongoId).required().messages(productIdMessages),
    },
  });

  const payload = {
    ...params,
    storeId: params.storeId || req.storeId,
  };

  const { error, value } = schema.validate({ params: payload }, { stripUnknown: true });
  if (error) {
    return handleError({ error, next });
  }
  const { storeId, productId } = value.params;
  if (!storeId || !userId || !productId) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: `Either no user, storeId or productId`,
      publicMessage: 'Ressource not found',
    });
    return next(error);
  }
  const product = await ProductModel.findOne({ _id: productId, storeId, owner: userId }).exec();
  if (!product?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.FORBIDEN,
      message: `User ${userId} may not be the owner of the store (${storeId}) or product (${productId})`,
      publicMessage: 'Please make sure the product and store exist and you are the owner of both',
    });
    return next(error);
  }
  req.isProductOwner = true;
  req.productId = productId;
  req.storeId = storeId;
  next();
};
