import { Router } from 'express';

import { loginCtrl } from '../controllers/auth';

const authRouter = Router();

authRouter.post('/login', loginCtrl);

export { authRouter };
