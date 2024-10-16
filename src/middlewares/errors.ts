import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS_CODES } from '../types/enums';
import Joi from 'joi';

interface ErrorArgs {
  statusCode?: number;
  message: string;
  publicMessage?: string;
}

export class GenericError extends Error {
  statusCode: number;
  publicMessage: string;

  constructor({ statusCode, message, publicMessage }: ErrorArgs) {
    super();
    this.statusCode = statusCode || HTTP_STATUS_CODES.STH_WENT_WRONG;
    this.message = message;
    this.publicMessage = publicMessage || 'Something went wrong';
  }
}

export const errorHandler = (error: GenericError, _req: Request, res: Response, _next: NextFunction) => {
  const { statusCode = HTTP_STATUS_CODES.STH_WENT_WRONG, message, publicMessage = 'Something went wrong' } = error;
  console.error('**** Error Caught here ****** ', message);
  res.status(statusCode).json({
    errors: [
      {
        statusCode,
        publicMessage,
      },
    ],
  });
};

export const createError = ({ statusCode, message, publicMessage }: ErrorArgs): GenericError => {
  return new GenericError({ statusCode, message, publicMessage });
};

export const convertToGenericError = ({ error, statusCode }: { error: Joi.ValidationError; statusCode: number }): GenericError => {
  const message = error.message;
  return createError({ statusCode, message, publicMessage: message });
};
