import { Router } from 'express';

import * as productCtrl from '../controllers/products';
import * as productMiddlewares from '../middlewares/products';
import * as storeMiddlewares from '../middlewares/store';

const productsRouter = Router();

productsRouter.get('/', productCtrl.getAllProducts);
productsRouter.delete('/:productId', storeMiddlewares.getStore, productMiddlewares.isProductOwner, productCtrl.deleteOne);

export { productsRouter };
