import { sign, SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { createError } from '../middlewares/errors';
import { HTTP_STATUS_CODES } from '../types/enums';

export const generateToken = async ({ email, userId }: { email: string; userId: string }): Promise<API_TYPES.Routes['business']['login']> => {
  const signAccessSecret = process.env.ACCESS_TOKEN_SECRET;
  const signRefreshSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!signAccessSecret || !signRefreshSecret) {
    const error = createError({
      statusCode: HTTP_STATUS_CODES.STH_WENT_WRONG,
      message: 'Could not find ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET env variable ',
    });
    return { error };
  }
  const accessPayload = {
    email,
  };
  const accessOptions: SignOptions = {
    issuer: 'http://localhost:8000',
    subject: userId,
    jwtid: uuidv4(),
    expiresIn: '5m',
    header: {
      typ: 'Bearer',
      alg: 'HS256',
    },
  };
  const refreshPayload = {
    email,
  };
  const refreshOptions: SignOptions = {
    issuer: 'http://localhost:8000',
    subject: userId,
    jwtid: uuidv4(),
    expiresIn: '10m',
    header: {
      typ: 'Bearer',
      alg: 'HS256',
    },
  };
  const accessToken = sign(accessPayload, signAccessSecret, accessOptions);
  const refreshToken = sign(refreshPayload, signRefreshSecret, refreshOptions);
  return {
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};
