import express, { Request, Response } from 'express';

import { HTTP_STATUS_CODES } from '../types/enums';

const orderRouters = express.Router();

const getOrders = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ orders: [] });
};

orderRouters.get('/', getOrders);

export { orderRouters };
