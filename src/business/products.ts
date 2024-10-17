import isEmpty from 'lodash.isempty';

import { GeneralResponse } from '../types/models';
import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import { ProductModel } from '../models/product';
import { StoreModel } from '../models/store';

type AddProductPayload = API_TYPES.Routes['business']['products']['add'];
type AddProductReturn = Promise<GeneralResponse<{ productId: string }>>;
export const addProduct = async ({ owner, storeId, body }: AddProductPayload): AddProductReturn => {
  if (!body || isEmpty(body)) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: 'No body associated with the request',
      publicMessage: 'Please provide valid fields ',
    });
    return { error };
  }

  const product = await ProductModel.create({
    owner,
    storeId,
    ...body,
  });
  product._id;
  const productId = product._id.toString();
  await StoreModel.findByIdAndUpdate(storeId, {
    $push: { products: productId },
  });
  return { data: { productId } };
};
