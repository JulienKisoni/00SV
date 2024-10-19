import { NextFunction, Response } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { HTTP_STATUS_CODES } from '../types/enums';
import { ExtendedRequest, IProductDocument } from '../types/models';
import { createError, handleError } from './errors';
import { regex } from '../helpers/constants';
import { ProductModel } from '../models/product';
import { RootFilterQuery } from 'mongoose';

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

type AddReviewBody = API_TYPES.Routes['body']['reviews']['add'];
type AddReviewPayload = AddReviewBody | undefined;
export const isNotProductOwner = async (req: ExtendedRequest<AddReviewBody>, _res: Response, next: NextFunction) => {
  const ownerMessages: LanguageMessages = {
    'any.required': "Could not retreive your user's information",
    'string.pattern.base': 'Please provide a valid owner id',
  };
  const productIdMessages: LanguageMessages = {
    'any.required': 'Please provide a product id',
    'string.pattern.base': 'Please provide a valid product id',
  };
  const schema = Joi.object<AddReviewPayload>({
    owner: Joi.string().regex(regex.mongoId).required().messages(ownerMessages),
    productId: Joi.string().regex(regex.mongoId).required().messages(productIdMessages),
  });
  const payload: AddReviewPayload = {
    productId: req.body?.productId,
    owner: req.user?._id.toString(),
  };

  const { error, value } = schema.validate(payload, { stripUnknown: true });
  if (error) {
    return handleError({ error, next });
  }
  const userId = value?.owner;
  const productId = value?.productId;

  if (!userId || !productId) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: `Either no userId (${userId}) or productId (${productId})`,
      publicMessage: 'Could not find associated user or product ',
    });
    return handleError({ error, next });
  }

  const product = await ProductModel.findOne({ _id: productId, owner: userId }).exec();
  if (product?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.FORBIDEN,
      message: `User (${userId}) is the owner of the product (${productId})`,
      publicMessage: "You're not allowed to review your own product",
    });

    req.isProductOwner = true;
    return handleError({ error, next });
  }
  req.isProductOwner = false;
  return next();
};

interface IGetProdMiddleware {
  reviewId?: string;
  productId?: string;
}
export const getProduct = async (req: ExtendedRequest<undefined>, _res: Response, next: NextFunction) => {
  const params = req.params as unknown as IGetProdMiddleware;

  const reviewIdMessages: LanguageMessages = {
    'string.pattern.base': 'Please provide a valid review id',
  };
  const productIdMessages: LanguageMessages = {
    'string.pattern.base': 'Please provide a valid product id',
  };

  const schema = Joi.object<IGetProdMiddleware>({
    reviewId: Joi.string().regex(regex.mongoId).messages(reviewIdMessages),
    productId: Joi.string().regex(regex.mongoId).messages(productIdMessages),
  });

  const { error, value } = schema.validate(params);
  if (error) {
    return handleError({ error, next });
  }

  const { productId, reviewId } = value;
  let query: RootFilterQuery<IProductDocument>;
  if (reviewId || !productId) {
    query = {
      reviews: value.reviewId,
    };
  } else {
    query = {
      _id: productId,
    };
  }
  const product = await ProductModel.findOne(query).exec();

  if (!product?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `Could not find product associated to this review (${value.reviewId})`,
      publicMessage: 'Could not find any product associated with your request',
    });
    req.productId = undefined;
    return handleError({ error, next });
  }

  req.productId = product._id.toString();
  return next();
};
