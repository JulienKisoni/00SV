import { model, Model, Schema } from 'mongoose';
import { IProductDocument } from 'src/types/models';

export interface IProductMethods extends IProductDocument {}

export interface IProductStatics extends Model<IProductDocument> {}

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    storeId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Store',
    },
    description: {
      type: String,
      required: true,
      min: 12,
      max: 100,
    },
    minQuantity: {
      type: Number,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    active: {
      type: Boolean,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ProductModel = model<IProductMethods, IProductStatics>('Product', productSchema, 'Products');
