import { Router } from 'express';

import * as userCtrl from '../controllers/users';
import * as userMiddleware from '../middlewares/users';
import * as orderCtrl from '../controllers/orders';

const usersRouter = Router();

/* [GET] */
usersRouter.get('/', userCtrl.getUsers);
usersRouter.get('/:userId', userCtrl.getOneUser);
usersRouter.get('/me/orders', orderCtrl.getUserOrders);

/* [POST] */
usersRouter.post('/signup', userCtrl.addUserCtrl);
usersRouter.post('/invalidateToken', userMiddleware.isAdmin, userCtrl.invalidateToken);

/* [PATCH] */
usersRouter.patch('/:userId', userCtrl.editUser);

/* [DELETE] */
usersRouter.delete('/:userId', userCtrl.deleteUser);

export { usersRouter };
