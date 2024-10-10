import { IUserDocument } from '../types/models';
import { UserModel } from '../models/user';
import { createError, GenericError } from '../middlewares/errors';
import { encrypt } from '../utils/hash';
import { HTTP_STATUS_CODES } from '../types/enums';

type AddUserPayload = Omit<IUserDocument, '_id' | 'storeId' | 'createdAt' | 'updatedAt'>;
type AddUserReturn = {
  error?: GenericError;
  userId?: string;
};

export const addUser = async ({ username, email, password }: AddUserPayload): Promise<AddUserReturn> => {
  const user = await UserModel.findOne({ email }).exec();
  if (user && user._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.DUPLICATED_RESOURCE,
      publicMessage: 'User with this email already exist',
      message: 'Cannot create user with exisint email ',
    });
    return { error };
  }
  const { error, encryptedText } = await encrypt({ plainText: password });
  if (error) {
    return { error };
  }
  const result = await UserModel.create({
    email,
    username,
    password: encryptedText,
  });
  const userId = result._id;
  return { userId };
};
