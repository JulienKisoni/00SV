import express, { Request, Response } from 'express';

const productsRouter = express.Router();

const getProducts = (_req: Request, res: Response) => {
    res.status(200).json({ products: [] });
}

productsRouter.get('/', getProducts)

export { productsRouter };