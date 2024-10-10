import { Schema } from 'mongoose';

export interface IUserDocument {
  _id: string;
  username: string;
  email: string;
  password: string;
  storeId?: string | Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
