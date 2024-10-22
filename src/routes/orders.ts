import { Router } from 'express';

import * as orderCtrl from '../controllers/orders';

const orderRouters = Router();

/* [GET] */
orderRouters.get('/', orderCtrl.getAllOrders);

/* [POST] */
orderRouters.post('/', orderCtrl.addOrder);

export { orderRouters };
