import ShortUniqueId from 'short-unique-id';
import omit from 'lodash.omit';

import { CartItem, GeneralResponse, IOrderDocument, IProductDocument } from '../types/models';
import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES, ORDER_STATUS } from '../types/enums';
import { ProductModel } from '../models/product';
import { OrderModel } from '../models/order';

type TransformKeys = keyof IOrderDocument;
interface ITransformOrder {
  excludedFields: TransformKeys[];
  order: IOrderDocument;
}
const transformOrder = ({ order, excludedFields }: ITransformOrder): Partial<IOrderDocument> => {
  return omit(order, excludedFields);
};

interface CalculatePriceArgs {
  items: CartItem[];
  products: IProductDocument[];
}
const calculateTotalPrice = (params: CalculatePriceArgs): number => {
  const { items, products } = params;
  const cartItems: { unitPrice: number; quantity: number }[] = [];
  products.forEach((product) => {
    const item = items.find((item) => item.productId.toString() === product._id.toString());
    if (item) {
      cartItems.push({ unitPrice: product.unitPrice, quantity: item.quantity });
    }
  });
  const prices: number[] = cartItems.map((item) => {
    return item.quantity * item.unitPrice;
  });
  const totalPrice: number = prices.reduce((prev, current) => {
    return prev + current;
  });
  return totalPrice;
};

const generateOrderNumber = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate();
  const id = new ShortUniqueId({ length: 5 }).rnd().toUpperCase();
  const orderNumber = `${day}-${month}-${year}-${id}`;
  return orderNumber;
};

type ValidCreateOrderPayload = Pick<IOrderDocument, 'items' | 'owner' | 'totalPrice' | 'orderNumber' | 'status'>;
type AddOrderBody = API_TYPES.Routes['body']['orders']['add'];
interface AddOrderParams {
  owner?: string;
  body: AddOrderBody;
}
type AddOrderResponse = Promise<GeneralResponse<{ orderId: string }>>;
export const addOrder = async (params: AddOrderParams): AddOrderResponse => {
  const { owner, body } = params;
  const { items } = body;

  if (!items?.length) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: 'No items associated with the request',
      publicMessage: 'Please add valid items to your order',
    });
    return { error };
  }
  if (!owner) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.UNAUTHORIZED,
      message: 'No user associated with the request',
      publicMessage: 'Please make sure you are logged in',
    });
    return { error };
  }

  const productIds: string[] = items.map((item) => item.productId);

  const products = await ProductModel.find({ _id: { $in: productIds } });

  if (productIds.length !== products?.length) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: 'Could not find some products',
      publicMessage: 'There are some non existing products within your order',
    });
    return { error };
  }

  const totalPrice = calculateTotalPrice({ items, products });
  const orderNumber = generateOrderNumber();

  const payload: ValidCreateOrderPayload = {
    owner,
    totalPrice,
    items,
    orderNumber,
    status: ORDER_STATUS.PENDING,
  };

  const order = await OrderModel.create(payload);

  return { data: { orderId: order._id.toString() } };
};

type GetAllOrdersResponse = Promise<GeneralResponse<{ orders: Partial<IOrderDocument>[] }>>;
export const getAllOrders = async (): GetAllOrdersResponse => {
  const results = await OrderModel.find({}).lean().exec();
  const orders = results.map((order) => transformOrder({ order, excludedFields: ['__v'] }));
  return { data: { orders } };
};

interface GetOneOrderPayload {
  order?: IOrderDocument;
  userId?: string;
  orderId?: string;
}
type GetOneOrderResponse = Promise<GeneralResponse<{ order: Partial<IOrderDocument> }>>;
export const getOneOrder = async (payload: GetOneOrderPayload): GetOneOrderResponse => {
  const { order, userId, orderId } = payload;
  if (order?._id.toString() !== orderId || order?.owner.toString() !== userId || !order) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `No order found (${orderId})`,
      publicMessage: 'Could not found order',
    });
    return { error };
  }
  return { data: { order: transformOrder({ order, excludedFields: ['__v'] }) } };
};

export const getUserOrders = async () => {};
