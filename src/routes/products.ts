import { Router } from 'express';

import * as productCtrl from '../controllers/products';

const productsRouter = Router();

productsRouter.get('/', productCtrl.getAllProducts);

export { productsRouter };
