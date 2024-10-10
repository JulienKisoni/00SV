import express, { NextFunction, Request, Response } from 'express';

import * as userCtrl from '../controllers/users';
import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';

const usersRouter = express.Router();

const getUsers = (req: Request, res: Response, next: NextFunction) => {
  const { users } = req.body;
  if (!users) {
    const err = createError({ statusCode: HTTP_STATUS_CODES.NOT_FOUND, message: 'No users found', publicMessage: 'No users were found' });
    return next(err);
  } else {
    users.add('me');
  }
  res.status(HTTP_STATUS_CODES.OK).json({ users });
};

usersRouter.get('/', getUsers);
usersRouter.post('/signup', userCtrl.addUserCtrl);

export { usersRouter };
