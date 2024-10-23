import isEmpty from 'lodash.isempty';
import omit from 'lodash.omit';

import { GeneralResponse, IProductDocument, IReviewDocument, RetreiveOneFilters } from '../types/models';
import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import { ProductModel } from '../models/product';
import { StoreModel } from '../models/store';
import { transformReview } from './reviews';

const retrieveProduct = async (filters: RetreiveOneFilters<IProductDocument>): Promise<IProductDocument | null> => {
  const product = (await ProductModel.findOne(filters).populate({ path: 'reviews' }).lean().exec()) as IProductDocument;
  if (!product || product === null) {
    return null;
  }
  const reviewDetails = product.reviews as unknown as IReviewDocument[];
  const reviews = reviewDetails.map((review) => review._id.toString());

  product.reviews = reviews;
  product.reviewDetails = reviewDetails.map((review) => transformReview({ review, excludedFields: ['__v'] }));

  return product;
};

type TransformKeys = keyof IProductDocument;
interface ITransformProduct {
  excludedFields: TransformKeys[];
  product: IProductDocument;
}
export const transformProduct = ({ product, excludedFields }: ITransformProduct): Partial<IProductDocument> => {
  return omit(product, excludedFields);
};

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

type GetAllProductsReturn = Promise<{ products: Partial<IProductDocument>[] }>;
export const gettAllProducts = async (): GetAllProductsReturn => {
  const response = await ProductModel.find<IProductDocument>({ active: true }).lean().exec();
  const products = response.map((product) => transformProduct({ product, excludedFields: ['__v'] }));
  return { products: products || [] };
};

type GetStoreProductsPayload = API_TYPES.Routes['business']['products']['getByStoreId'];
type GetStoreProductsResponse = Promise<{ products: Partial<IProductDocument>[] }>;
export const getStoreProducts = async ({ storeId }: GetStoreProductsPayload): GetStoreProductsResponse => {
  const response = await ProductModel.find({ storeId, active: true }).lean().exec();
  const products = response.map((product) => transformProduct({ product, excludedFields: ['__v'] }));
  return { products: products || [] };
};

type DeleteOneProductPayload = API_TYPES.Routes['params']['products']['deleteOne'];
type DeleteOneProductResponse = Promise<GeneralResponse<undefined>>;
export const deleteOne = async ({ productId, storeId }: DeleteOneProductPayload): DeleteOneProductResponse => {
  const product = await ProductModel.findByIdAndDelete(productId).exec();
  if (!product?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `Product (${productId}) not found`,
      publicMessage: 'This product does not exist',
    });
    return { error, data: undefined };
  }
  await StoreModel.findByIdAndUpdate(storeId, { $pull: { products: productId } }).exec();
  return { error: undefined, data: undefined };
};

type GetOneProductPayload = API_TYPES.Routes['params']['products']['getOne'];
type GetOneProductResponse = Promise<GeneralResponse<Partial<IProductDocument>>>;
export const getOne = async ({ productId }: GetOneProductPayload): GetOneProductResponse => {
  const result = await retrieveProduct({ _id: productId });
  if (!result) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `No product found (${productId})`,
      publicMessage: 'Product does not exist',
    });
    return { error };
  }
  const product = transformProduct({ product: result, excludedFields: ['__v'] });
  return { data: product };
};

type UpdateProductBody = API_TYPES.Routes['body']['products']['updateOne'];
interface UpdateProductPayload {
  productId: string;
  body: Partial<UpdateProductBody>;
}
type UpdateProductResponse = Promise<GeneralResponse<undefined>>;
export const updateOne = async ({ body, productId }: Partial<UpdateProductPayload>): UpdateProductResponse => {
  if (!body || isEmpty(body)) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: 'No body associated with the request',
      publicMessage: 'Please provide valid fields ',
    });
    return { error };
  }
  const product = await ProductModel.findByIdAndUpdate(productId, body).exec();
  if (!product?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `Product not found (${productId})`,
      publicMessage: 'This product does not exist',
    });
    return { error };
  }
  return { data: undefined };
};
