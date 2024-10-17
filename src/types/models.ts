import { Schema } from 'mongoose';
import { Request } from 'express';

import { GenericError } from '../middlewares/errors';

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
}

export interface IStoreDocument extends Timestamps {
  _id: string | Schema.Types.ObjectId;
  name: string;
  owner: string | Schema.Types.ObjectId;
  products: (string | Schema.Types.ObjectId)[];
  description: string;
  active: boolean;
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
}

export interface GeneralResponse<T> {
  error?: GenericError;
  data?: T;
}
export interface ExtendedRequest<B> extends Request {
  body: B;
  user?: IUserDocument;
  isStoreOwner?: boolean;
}
