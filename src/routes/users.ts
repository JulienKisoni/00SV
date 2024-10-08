import express, { NextFunction, Request, Response } from 'express';

import { createError } from '../middlewares/errors';

const usersRouter = express.Router();

const getUsers = (req: Request, res: Response, next: NextFunction) => {
    const { users } = req.body;
    if (!users) {
        const err = createError({ statusCode: 404, message: 'No users found', publicMessage: 'No users were found' });
        return next(err);
    } else {
        users.add('me');
    }
    res.status(200).json({ users });
}

usersRouter.get('/', getUsers)

export { usersRouter };