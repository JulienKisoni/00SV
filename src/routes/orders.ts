import express, { Request, Response } from 'express';

const orderRouters = express.Router();

const getOrders = (_req: Request, res: Response) => {
    res.status(200).json({ orders: [] });
}

orderRouters.get('/', getOrders)

export { orderRouters };