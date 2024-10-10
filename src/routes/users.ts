import { Router } from 'express';

import * as userCtrl from '../controllers/users';
import { validateToken } from '../middlewares/validateToken';

const usersRouter = Router();

usersRouter.get('/', validateToken, userCtrl.getUsers);
usersRouter.post('/signup', userCtrl.addUserCtrl);

export { usersRouter };
