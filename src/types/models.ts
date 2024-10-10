import { Schema } from 'mongoose';

export type User = {
  _id: string;
  username: string;
  email: string;
  password: string;
  storeId?: string | Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};
