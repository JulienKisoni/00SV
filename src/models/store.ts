import { Model, Schema, model } from 'mongoose';
import { IStoreDocument } from 'src/types/models';

export interface IStoreMethods extends IStoreDocument {}

export interface IStoreStatics extends Model<IStoreDocument> {}

const storeSchema = new Schema<IStoreDocument>({
  name: {
    type: String,
    required: true,
    min: 6,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  products: [{ type: String }],
  description: {
    type: String,
    required: true,
    min: 12,
    max: 100,
  },
  active: {
    type: Boolean,
    required: true,
  },
});

export const StoreModel = model<IStoreMethods, IStoreStatics>('Store', storeSchema, 'Stores');
