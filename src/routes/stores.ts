import express from 'express';

import * as storeCtrl from '../controllers/stores';

const storesRouter = express.Router();

storesRouter.get('/', storeCtrl.getStores);
storesRouter.post('/:userId/add', storeCtrl.addStore);
storesRouter.delete('/:storeId', storeCtrl.deleteStore);

export { storesRouter };
