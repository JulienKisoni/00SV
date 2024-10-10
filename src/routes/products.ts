import express, { Request, Response } from 'express';

import { HTTP_STATUS_CODES } from '../types/enums';

const productsRouter = express.Router();

const getProducts = (_req: Request, res: Response) => {
  res.status(HTTP_STATUS_CODES.OK).json({ products: [] });
};

productsRouter.get('/', getProducts);

export { productsRouter };
