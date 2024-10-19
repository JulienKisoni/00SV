import express, { Request, Response } from 'express';

import { usersRouter } from './users';
import { storesRouter } from './stores';
import { productsRouter } from './products';
import { reviewRouter } from './reviews';
import { orderRouters } from './orders';
import { authRouter } from './auth';
import { HTTP_STATUS_CODES } from '../types/enums';

const router = express.Router();

const getController = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ res: 'ok' });
};

/* GET home page. */
router.get('/', getController);

router.use('/users', usersRouter);
router.use('/stores', storesRouter);
router.use('/products', productsRouter);
router.use('/reviews', reviewRouter);
router.use('/orders', orderRouters);
router.use('/auth', authRouter);

export default router;
