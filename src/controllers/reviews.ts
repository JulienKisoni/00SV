import { NextFunction, Response } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { ExtendedRequest } from '../types/models';
import { regex } from '../helpers/constants';
import { handleError } from '../middlewares/errors';
import * as reviewBusiness from '../business/reviews';
import { HTTP_STATUS_CODES } from '../types/enums';

type AddReviewBody = API_TYPES.Routes['body']['reviews']['add'];
type AddReviewPayload = AddReviewBody | undefined;
export const addReview = async (req: ExtendedRequest<AddReviewBody>, res: Response, next: NextFunction) => {
  const ownerMessages: LanguageMessages = {
    'any.required': "Could not retreive your user's information",
    'string.pattern.base': 'Please provide a valid owner id',
  };
  const productIdMessages: LanguageMessages = {
    'any.required': 'Please provide a product id',
    'string.pattern.base': 'Please provide a valid product id',
  };
  const titleMessages: LanguageMessages = {
    'any.required': 'Please provide a review title',
  };
  const contentMessages: LanguageMessages = {
    'any.required': 'Please provide a review content',
    'string.min': 'The field content must have 12 characters mininum',
    'string.max': 'The field content must have 100 characters maximum',
  };
  const starsMessages: LanguageMessages = {
    'any.required': 'Please provide a review stars rate',
    'number.min': 'The stars field value cannot be bellow 0',
    'number.max': 'The stars field value cannot be above 5',
  };
  const schema = Joi.object<AddReviewPayload>({
    owner: Joi.string().regex(regex.mongoId).required().messages(ownerMessages),
    productId: Joi.string().regex(regex.mongoId).required().messages(productIdMessages),
    title: Joi.string().required().messages(titleMessages),
    content: Joi.string().max(100).min(12).required().messages(contentMessages),
    stars: Joi.number().max(5).min(0).required().messages(starsMessages),
  });

  const payload: AddReviewPayload = {
    owner: req.user?._id.toString(),
    ...req.body,
  };

  const { error, value } = schema.validate(payload, { stripUnknown: true, abortEarly: true });
  if (error) {
    return handleError({ error, next });
  }

  const { error: _error, data } = await reviewBusiness.addReview(value);
  if (_error) {
    return handleError({ error: _error, next });
  }

  res.status(HTTP_STATUS_CODES.OK).json(data);
};
