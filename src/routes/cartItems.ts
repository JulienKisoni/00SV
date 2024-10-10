import express, { Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '../types/enums';

const cartItemsRouter = express.Router();

const getCartItems = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ cartItems: [] });
};

cartItemsRouter.get('/', getCartItems);

export { cartItemsRouter };
