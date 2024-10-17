import express, { Request, Response } from 'express';

import { HTTP_STATUS_CODES } from '../types/enums';
import * as productCtrl from '../controllers/products';
import * as storeMiddlewares from '../middlewares/store';

const productsRouter = express.Router();

const getProducts = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ products: [] });
};

productsRouter.get('/', getProducts);
productsRouter.post('/:storeId', storeMiddlewares.isStoreOwner, productCtrl.addProduct);

export { productsRouter };
