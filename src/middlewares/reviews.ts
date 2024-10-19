import { NextFunction, Response } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { regex } from '../helpers/constants';
import { HTTP_STATUS_CODES } from '../types/enums';
import { ExtendedRequest } from '../types/models';
import { handleError, createError } from './errors';
import { ReviewModel } from '../models/review';

type AddReviewBody = API_TYPES.Routes['body']['reviews']['add'];
type AddReviewPayload = AddReviewBody | undefined;
export const notAlreadyReviewed = async (req: ExtendedRequest<AddReviewBody>, _res: Response, next: NextFunction) => {
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

  const review = await ReviewModel.findOne({ owner: userId, productId }).exec();
  if (review?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.FORBIDEN,
      message: `User (${userId}) has already reviewed the product (${productId})`,
      publicMessage: "You're not allowed to add two reviews for the same product",
    });

    req.hasAlreadyRevieweProduct = true;
    return handleError({ error, next });
  }
  req.hasAlreadyRevieweProduct = false;
  return next();
};