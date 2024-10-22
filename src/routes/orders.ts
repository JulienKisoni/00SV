import { Request, Response, Router } from 'express';

import { HTTP_STATUS_CODES } from '../types/enums';
import * as orderCtrl from '../controllers/orders';

const orderRouters = Router();

const getOrders = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ orders: [] });
};

orderRouters.get('/', getOrders);
orderRouters.post('/', orderCtrl.addOrder);

export { orderRouters };
