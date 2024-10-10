import { HTTP_STATUS_CODES } from '../types/enums';
import { createError } from '../middlewares/errors';
import { UserModel } from '../models/user';
import { generateToken } from '../utils/tokens';

type LoginPaylod = API_TYPES.Routes['body']['login'];
type LoginResponse = API_TYPES.Routes['business']['login'];

export const login = async ({ email, password }: LoginPaylod): Promise<LoginResponse> => {
  const user = await UserModel.findByEmail(email);
  if (!user) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
      message: `User with email (${email}) does not exist`,
      publicMessage: 'Invalid credentials',
    });
    return { error };
  } else if (user.comparePassword) {
    const { areEqual } = await user.comparePassword(password);
    if (!areEqual) {
      const error = createError({
        statusCode: HTTP_STATUS_CODES.BAD_REQUEST,
        message: `Password (${password}) not matching`,
        publicMessage: 'Invalid credentials',
      });
      return { error };
    }
  }
  const { error, tokens } = await generateToken();
  if (error) {
    return { error };
  }
  return { tokens };
};
