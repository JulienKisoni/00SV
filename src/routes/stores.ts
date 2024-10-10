import express, { Request, Response } from 'express';

import { HTTP_STATUS_CODES } from '../types/enums';

const storesRouter = express.Router();

const getStores = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ stores: [] });
};

storesRouter.get('/', getStores);

export { storesRouter };
