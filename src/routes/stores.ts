import express from 'express';

import * as storeCtrl from '../controllers/stores';
import * as storeMiddlewares from '../middlewares/store';

const storesRouter = express.Router();

storesRouter.get('/', storeCtrl.getStores);
storesRouter.post('/:userId/add', storeCtrl.addStore);
storesRouter.get('/:storeId', storeCtrl.getOneStore);
storesRouter.delete('/:storeId', storeCtrl.deleteStore);
storesRouter.patch('/:storeId', storeMiddlewares.isStoreOwner, storeCtrl.editStore);

export { storesRouter };
