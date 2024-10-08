import { NextFunction, Request, Response } from "express";

interface ErrorArgs { 
    statusCode?: number;
    message: string;
    publicMessage?: string;
}

export class GenericError extends Error {
  statusCode: number;
  publicMessage: string;

  constructor({statusCode, message, publicMessage}: ErrorArgs ) {
    super();
    this.statusCode = statusCode || 500;
    this.message = message;
    this.publicMessage = publicMessage || 'Something went wrong';
  }
}

export const errorHandler = (error: GenericError, _req: Request, res: Response, _next: NextFunction) => {
    const { statusCode = 500, message, publicMessage = 'Something went wrong' } = error;
    console.error('**** Error Caught here****** ', message);
    res.status(statusCode).json({
      errors: [
          {
              statusCode,
              publicMessage,
          }
      ]
    });
}

export const createError = ({statusCode, message, publicMessage }: ErrorArgs): GenericError => {
    return new GenericError({ statusCode, message, publicMessage });
}
