import express, { Request, Response } from 'express';

const usersRouter = express.Router();

const getUsers = (_req: Request, res: Response) => {
    res.status(200).json({ users: [] });
}

usersRouter.get('/', getUsers)

export { usersRouter };