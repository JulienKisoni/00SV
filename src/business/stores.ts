import omit from 'lodash.omit';

import { IUserMethods, UserModel } from '../models/user';
import { StoreModel } from '../models/store';
import { createError, GenericError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';
import { IStoreDocument } from 'src/types/models';

type AddStorePayload = API_TYPES.Routes['business']['addStore'];
type AddStoreResponse = Promise<{ storeId?: string; error?: GenericError }>;
export const addStore = async ({ userId, name, description, active }: AddStorePayload): AddStoreResponse => {
  const user = await UserModel.findById<IUserMethods>(userId).exec();
  if (!user || !user._id || !user?.updateSelf) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `No user with this specific id (${userId})`,
      publicMessage: 'User does not exist',
    });
    return { error };
  }
  const store = await StoreModel.create({
    owner: userId,
    name,
    description,
    active,
  });
  const storeId = store._id.toString();
  await user.updateSelf({ $push: { storeIds: storeId } });
  return { storeId };
};

type GetStoresResponse = Promise<{ stores: Partial<IStoreDocument>[] }>;
export const getStores = async (): GetStoresResponse => {
  const stores = await StoreModel.find({}).lean().exec();
  const transformed = stores.map((store) => omit(store, ['__v']));
  return { stores: transformed };
};
