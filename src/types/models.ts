import { Schema } from 'mongoose';

export enum USER_ROLES {
  user = 'user',
  admin = 'admin',
}

interface ExpToken {
  tokenId: string;
  expiryAt?: number;
}
export interface IUserDocument {
  _id: string | Schema.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  storeIds?: string | Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  profile: {
    role: USER_ROLES;
  };
  private?: {
    invalidToken: ExpToken;
  };
}

export interface IStoreDocument {
  _id: string | Schema.Types.ObjectId;
  name: string;
  owner: string | Schema.Types.ObjectId;
  products: (string | Schema.Types.ObjectId)[];
  createdAt: Date;
  updatedAt: Date;
  description: string;
  active: boolean;
}
