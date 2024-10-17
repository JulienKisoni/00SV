import { Router } from 'express';

import * as userCtrl from '../controllers/users';
import * as userMiddleware from '../middlewares/users';

const usersRouter = Router();

usersRouter.get('/', userCtrl.getUsers);
usersRouter.post('/signup', userCtrl.addUserCtrl);
usersRouter.patch('/:userId', userCtrl.editUser);
usersRouter.get('/:userId', userCtrl.getOneUser);
usersRouter.post('/invalidateToken', userMiddleware.isAdmin, userCtrl.invalidateToken);
usersRouter.delete('/:userId', userCtrl.deleteUser);

export { usersRouter };
