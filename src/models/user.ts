import { Schema, model, Model } from 'mongoose';

import { IUserDocument } from '../types/models';
import { compareValues } from '../utils/hash';
export interface IUserMethods extends IUserDocument {
  comparePassword?: (password: string) => Promise<{ areEqual: boolean }>;
}

export interface IUserStatics extends Model<IUserMethods> {
  findByEmail(email: string): Promise<IUserMethods | null>;
}

const userSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      min: 6,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 6,
    },
    storeId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
    statics: {
      async findByEmail(email: string): Promise<IUserMethods | null> {
        const user = await this.findOne<IUserMethods>({ email }).exec();
        return user;
      },
    },
    methods: {
      async comparePassword(plainPassword: string): Promise<{ areEqual: boolean }> {
        return await compareValues({ plainText: plainPassword, encryptedText: this.password });
      },
    },
  },
);

export const UserModel = model<IUserMethods, IUserStatics>('User', userSchema, 'Users');
