import express, { Request, Response} from 'express';

import { usersRouter } from './users';
import { storesRouter } from './stores';
import { productsRouter } from './products';
import { cartItemsRouter } from './cartItems';
import { orderRouters } from './orders';

const router = express.Router();

const getController = (_req: Request, res: Response) => {
    res.status(200).json({ res: 'ok' });
}

/* GET home page. */
router.get('/', getController);

router.use('/users', usersRouter);
router.use('/stores', storesRouter);
router.use('/products', productsRouter);
router.use('/cartItems', cartItemsRouter);
router.use('/orders', orderRouters);

export default router;
