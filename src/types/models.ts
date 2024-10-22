import { Schema } from 'mongoose';
import { Request } from 'express';

import { GenericError } from '../middlewares/errors';
import { ORDER_STATUS } from './enums';

export enum USER_ROLES {
  user = 'user',
  admin = 'admin',
}

interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

interface ExpToken {
  tokenId: string;
  expiryAt?: number;
}
export interface IUserDocument extends Timestamps {
  _id: string | Schema.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  storeIds?: string | Schema.Types.ObjectId;
  profile: {
    role: USER_ROLES;
  };
  private?: {
    invalidToken: ExpToken;
  };
  __v: number;
}

export interface IStoreDocument extends Timestamps {
  _id: string | Schema.Types.ObjectId;
  name: string;
  owner: string | Schema.Types.ObjectId;
  products: (string | Schema.Types.ObjectId)[];
  description: string;
  active: boolean;
  __v: number;
}

export interface IProductDocument extends Timestamps {
  _id: string | Schema.Types.ObjectId;
  name: string;
  quantity: number;
  storeId: string | Schema.Types.ObjectId;
  description: string;
  minQuantity: number;
  owner: string | Schema.Types.ObjectId;
  active: boolean;
  unitPrice: number;
  reviews: (string | Schema.Types.ObjectId)[];
  __v: number;
}

export interface GeneralResponse<T> {
  error?: GenericError;
  data?: T;
}
export interface ExtendedRequest<B> extends Request {
  body: B | undefined;
  user?: IUserDocument;
  isStoreOwner?: boolean;
  isProductOwner?: boolean;
  isReviewOwner?: boolean;
  isOrderOwner?: boolean;
  order?: IOrderDocument;
  hasAlreadyRevieweProduct?: boolean;
  storeId?: string;
  productId?: string;
}

export interface IReviewDocument extends Timestamps {
  _id: string | Schema.Types.ObjectId;
  title: string;
  content: string;
  stars: number;
  productId: string | Schema.Types.ObjectId;
  owner: string | Schema.Types.ObjectId;
  __v: number;
}

export interface CartItem {
  productId: string | Schema.Types.ObjectId;
  quantity: number;
}

export interface IOrderDocument extends Timestamps {
  __v: number;
  _id: string | Schema.Types.ObjectId;
  items: CartItem[];
  owner: string | Schema.Types.ObjectId;
  totalPrice: number;
  orderNumber: string;
  status: ORDER_STATUS;
}
