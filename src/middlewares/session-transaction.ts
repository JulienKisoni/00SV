import { NextFunction, Response } from 'express';
import mongoose from 'mongoose';
import { ExtendedRequest } from 'src/types/models';

export const handleTransaction = async (req: ExtendedRequest<any>, _res: Response, next: NextFunction) => {
  const session = await mongoose.startSession();
  req.currentSession = session;
  req.currentSession.startTransaction();
  console.log('Session started id', session.id);
  next();
};
