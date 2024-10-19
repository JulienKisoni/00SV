import { Model, Schema, model } from 'mongoose';
import { IReviewDocument } from 'src/types/models';

interface IReviewMethods extends IReviewDocument {}

interface IReviewStatics extends Model<IReviewDocument> {}

const reviewSchema = new Schema<IReviewDocument>({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
    min: 12,
    max: 100,
  },
  stars: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

export const ReviewModel = model<IReviewMethods, IReviewStatics>('Review', reviewSchema, 'Reviews');
