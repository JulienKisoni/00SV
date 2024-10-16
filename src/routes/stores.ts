import express, { Request, Response } from 'express';

import { HTTP_STATUS_CODES } from '../types/enums';
import * as storeCtrl from '../controllers/stores';

const storesRouter = express.Router();

const getStores = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ stores: [] });
};

storesRouter.get('/', getStores);
storesRouter.post('/:userId/add', storeCtrl.addStore);

export { storesRouter };
