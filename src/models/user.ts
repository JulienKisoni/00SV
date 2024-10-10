import { Schema, model } from 'mongoose';
import type { User } from 'src/types/models';

const userSchema = new Schema<User>(
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
  { timestamps: true },
);

export const UserModel = model('User', userSchema, 'Users');
