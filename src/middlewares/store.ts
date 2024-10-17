import { NextFunction, Response, Request } from 'express';

import { IUserDocument } from '../types/models';
import { createError } from './errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import { StoreModel } from '../models/store';

type EditStoreBody = API_TYPES.Routes['business']['stores']['editStore'];
interface ExtendedRequest<B> extends Request {
  body: B;
  user?: IUserDocument;
  isStoreOwner?: boolean;
}
type EditStoreParams = {
  storeId: string;
};
export const isStoreOwner = async (req: ExtendedRequest<EditStoreBody>, _res: Response, next: NextFunction) => {
  const params = req.params as unknown as EditStoreParams;
  const userId = req.user?._id;
  const { storeId } = params;
  if (!storeId || !userId) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: `Either no user or storeId`,
      publicMessage: 'Ressource not found',
    });
    return next(error);
  }
  const store = await StoreModel.findOne({ _id: storeId, owner: userId }).exec();
  if (!store?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.FORBIDEN,
      message: `User ${userId} is not the owner of the store (${storeId})`,
      publicMessage: 'Please make sure the store exist and you are the owner',
    });
    return next(error);
  }
  req.isStoreOwner = true;
  next();
};
