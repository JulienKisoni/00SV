import express, { Request, Response } from 'express';

import { HTTP_STATUS_CODES } from '../types/enums';
import * as productMiddlewares from '../middlewares/products';
import * as reviewMiddlewares from '../middlewares/reviews';
import * as reviewCtrl from '../controllers/reviews';

const reviewRouter = express.Router();

const getCartItems = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ cartItems: [] });
};

reviewRouter.get('/', getCartItems);
reviewRouter.post('/', productMiddlewares.isNotProductOwner, reviewMiddlewares.notAlreadyReviewed, reviewCtrl.addReview);

export { reviewRouter };
