import express, { Request, Response } from 'express';

const cartItemsRouter = express.Router();

const getCartItems = (_req: Request, res: Response) => {
    res.status(200).json({ cartItems: [] });
}

cartItemsRouter.get('/', getCartItems)

export { cartItemsRouter };