import { Router } from 'express';

import * as productMiddlewares from '../middlewares/products';
import * as reviewMiddlewares from '../middlewares/reviews';
import * as reviewCtrl from '../controllers/reviews';

const reviewRouter = Router();

reviewRouter.get('/', reviewCtrl.getAllReviews);
reviewRouter.post('/', productMiddlewares.isNotProductOwner, reviewMiddlewares.notAlreadyReviewed, reviewCtrl.addReview);

export { reviewRouter };
