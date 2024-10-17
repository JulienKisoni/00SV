import { Response, NextFunction } from 'express';
import Joi from 'joi';

import { ExtendedRequest } from '../types/models';
import { regex } from '../helpers/constants';
import { handleError } from '../middlewares/errors';
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

  const schema = Joi.object<AddProductSchema>({
    params: {
      storeId: Joi.string().regex(regex.mongoId).required(),
    },
    body: {
      name: Joi.string().required(),
      quantity: Joi.number().required(),
      description: Joi.string().min(12).max(100).required(),
      minQuantity: Joi.number().required(),
      active: Joi.bool().required(),
      unitPrice: Joi.number().required(),
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
