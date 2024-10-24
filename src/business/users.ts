import omit from 'lodash.omit';
import isEmpty from 'lodash.isempty';
import { verify } from 'jsonwebtoken';
import { UpdateQuery } from 'mongoose';

import { IStoreDocument, IUserDocument, RetreiveOneFilters, USER_ROLES } from '../types/models';
import { IUserMethods, UserModel } from '../models/user';
import { createError, GenericError } from '../middlewares/errors';
import { encrypt } from '../utils/hash';
import { HTTP_STATUS_CODES } from '../types/enums';

const retrieveUser = async (filters: RetreiveOneFilters<IUserDocument>): Promise<IUserDocument | null> => {
  const user = (await UserModel.findOne(filters).populate({ path: 'storeIds' }).lean().exec()) as IUserDocument;
  if (!user || user === null) {
    return null;
  }
  const storeDetails = user.storeIds as unknown as IStoreDocument[];
  const storeIds = storeDetails.map((store) => store._id.toString());

  user.storeIds = storeIds;
  user.storesDetails = storeDetails;

  return user;
};

type TransformKeys = keyof IUserDocument;
interface ITransformProduct {
  excludedFields: TransformKeys[];
  user: IUserDocument;
}
export const transformUser = ({ user, excludedFields }: ITransformProduct): Partial<IUserDocument> => {
  return omit(user, excludedFields);
};

interface AddUserPayload extends Omit<IUserDocument, '_id' | 'storeId' | 'createdAt' | 'updatedAt'> {
  role: USER_ROLES;
}
type AddUserReturn = {
  error?: GenericError;
  userId?: string;
};

export const addUser = async ({ username, email, password, role }: AddUserPayload): Promise<AddUserReturn> => {
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
  const payload = {
    email,
    username,
    password: encryptedText,
    profile: {
      role,
    },
  };
  const result = await UserModel.create(payload);
  const userId = result._id;
  return { userId: userId.toString() };
};

export const getUsers = async (): Promise<Partial<IUserMethods>[]> => {
  const users = await UserModel.find<IUserMethods>({}).lean().exec();
  return (
    users.map((user) => {
      const transformed = transformUser({ user, excludedFields: ['password', '__v', 'private'] });
      return transformed;
    }) || []
  );
};

type Tokens = {
  accessToken?: string;
  refreshToken?: string;
};

export const saveToken = async ({ refreshToken, accessToken }: Tokens): Promise<void | GenericError> => {
  const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
  if (!refreshToken || !accessToken || !accessTokenSecret) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: 'Either no refreshToken, accessToken or accessTokenSecret',
      publicMessage: 'Invalid request',
    });
    Promise.resolve(error);
  } else {
    const { error, user } = await UserModel.findByRefreshToken(refreshToken);
    if (error) {
      return error;
    } else if (user && user.updateSelf) {
      try {
        const decoded = verify(accessToken, accessTokenSecret);
        const decodedToken = decoded as API_TYPES.DecodedToken;
        await user.updateSelf({
          'private.invalidToken': { tokenId: decodedToken.jti, expiryAt: 0 },
        });
      } catch (error) {
        return error;
      }
    }
  }
};

export const invalidateToken = async ({ userId }: { userId: string }): Promise<void> => {
  const user = await UserModel.findById<IUserMethods>(userId).exec();
  const currentToken = user?.private?.invalidToken;
  if (user?.updateSelf && (currentToken?.expiryAt || currentToken?.expiryAt === 0)) {
    const thirtyMinutes = 30 * 60 * 1000; // in ms
    const expiryAt = currentToken.expiryAt - thirtyMinutes;
    const update = { 'private.invalidToken': { tokenId: currentToken.tokenId, expiryAt } };
    await user.updateSelf(update);
  }
};

export const deleteOne = async ({ userId }: { userId: string }) => {
  return UserModel.deleteOne({ _id: userId }).exec();
};

type EditUserPayload = Pick<IUserDocument, 'email' | 'username' | 'profile'>;
interface EditUserParams {
  payload: Partial<EditUserPayload>;
  userId: string;
}
export const updateOne = async ({ payload, userId }: EditUserParams): Promise<{ error?: GenericError }> => {
  const update: UpdateQuery<EditUserPayload> = {};
  const { email, profile, username } = payload;
  if (!payload || isEmpty(payload)) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: `No body associated with the request`,
      publicMessage: 'Please provide valid fields to update',
    });
    return { error };
  }
  if (email) {
    update['email'] = email;
  }
  if (username) {
    update['username'] = username;
  }
  if (profile?.role) {
    update['profile.role'] = profile.role;
  }
  if (update && !isEmpty(update)) {
    const user = await UserModel.findById<IUserMethods>(userId).exec();
    if (user && user.updateSelf) {
      await user?.updateSelf(update);
    }
  }
  return { error: undefined };
};

type GetOneUserPayload = API_TYPES.Routes['business']['users']['getOne'];
interface GetOneUserResponse {
  error?: GenericError;
  user?: Partial<IUserDocument>;
}
export const getOne = async ({ userId }: GetOneUserPayload): Promise<GetOneUserResponse> => {
  const user = await retrieveUser({ _id: userId });
  if (!user?._id) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      message: `User with id ${userId} does not exist `,
      publicMessage: 'No user found',
    });
    return { error };
  }
  const transformed = transformUser({ user, excludedFields: ['password', '__v', 'private'] });
  return { user: transformed };
};
