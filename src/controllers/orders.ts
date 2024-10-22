import { Response, NextFunction } from 'express';
import Joi, { LanguageMessages } from 'joi';

import { ExtendedRequest } from '../types/models';
import { regex } from '../helpers/constants';
import { handleError } from '../middlewares/errors';
import * as orderBusiness from '../business/orders';
import { HTTP_STATUS_CODES } from '../types/enums';

type AddOrderBody = API_TYPES.Routes['body']['orders']['add'];
export const addOrder = async (req: ExtendedRequest<AddOrderBody>, res: Response, next: NextFunction) => {
  const owner = req.user?._id.toString();

  const productIdMessages: LanguageMessages = {
    'any.required': 'Please a productId is required for each item inside your order',
    'string.pattern.base': 'Please provide a valid productId for each item inside your order',
  };
  const quantityMessages: LanguageMessages = {
    'any.required': 'Please provide quantity for each item inside your order',
    'number.min': 'Each item inside your order should at leat have quantity equals to 1',
  };

  const schema = Joi.object<AddOrderBody>({
    items: Joi.array()
      .items(
        Joi.object({
          productId: Joi.string().regex(regex.mongoId).required().messages(productIdMessages),
          quantity: Joi.number().min(1).required().messages(quantityMessages),
        }),
      )
      .min(1)
      .required(),
  });

  const { error, value } = schema.validate(req.body, { stripUnknown: true, abortEarly: true });

  if (error) {
    return handleError({ error, next });
  }

  const { error: _error, data } = await orderBusiness.addOrder({ body: value, owner });
  if (_error) {
    return handleError({ error: _error, next });
  }

  res.status(HTTP_STATUS_CODES.OK).json(data);
};

export const getAllOrders = async (_req: ExtendedRequest<undefined>, res: Response, _next: NextFunction) => {
  const { data } = await orderBusiness.getAllOrders();
  res.status(HTTP_STATUS_CODES.OK).json(data);
};
