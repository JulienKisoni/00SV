import express, { Request, Response } from 'express';

const storesRouter = express.Router();

const getStores = (_req: Request, res: Response) => {
    res.status(200).json({ stores: [] });
}

storesRouter.get('/', getStores)

export { storesRouter };