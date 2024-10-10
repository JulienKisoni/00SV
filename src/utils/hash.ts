import { genSalt, hash } from 'bcrypt';

import { createError, GenericError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';

interface HashParams {
  plainText: string;
}
interface HashReturn {
  encryptedText?: string;
  error?: GenericError;
}

export const encrypt = async ({ plainText }: HashParams): Promise<HashReturn> => {
  const SALT_ROUND = process.env.SALT_ROUND;
  if (!SALT_ROUND) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.NOT_FOUND,
      publicMessage: 'Somthing went wrong',
      message: 'Cannot find SALT_ROUND env variable',
    });
    return { error };
  }
  const saltRound = parseInt(SALT_ROUND, 10);
  const salt = await genSalt(saltRound);
  const encryptedText = await hash(plainText, salt);
  return { encryptedText };
};
