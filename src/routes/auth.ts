import { Router } from 'express';

import { loginCtrl } from '../controllers/authCtrl';

const authRouter = Router();

authRouter.post('/login', loginCtrl);

export { authRouter };
