import isEmpty from 'lodash.isempty';

import { GeneralResponse } from '../types/models';
import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import { IProductMethods, ProductModel } from '../models/product';
import { ReviewModel } from '../models/review';

type AddReviewBody = API_TYPES.Routes['body']['reviews']['add'];
type AddReviewResponse = Promise<GeneralResponse<{ reviewId: string }>>;
type AddReviewPayload = AddReviewBody | undefined;

export const addReview = async (payload: AddReviewPayload): AddReviewResponse => {
  if (!payload || isEmpty(payload)) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: 'No payload associated with the request',
      publicMessage: 'Please provide valid fields',
    });
    return { error };
  }

  const { productId } = payload;

  const product = await ProductModel.findById<IProductMethods>(productId).exec();
  if (!product?._id || !product.addReview) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `Product (${productId}) not found`,
      publicMessage: 'This product does not exist',
    });
    return { error };
  }
  const review = await ReviewModel.create(payload);
  const reviewId = review._id.toString();
  await product.addReview(reviewId);
  return { data: { reviewId } };
};
