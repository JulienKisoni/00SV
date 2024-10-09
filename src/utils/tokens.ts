import { sign, SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { createError } from '../middlewares/errors';

export const generateToken = async (): Promise<API_TYPES.Routes['business']['login']> => {
  const signAccessSecret = process.env.ACCESS_TOKEN_SECRET;
  const signRefreshSecret = process.env.REFRESH_TOKEN_SECRET;
  if (!signAccessSecret || !signRefreshSecret) {
    const error = createError({ statusCode: 500, message: 'Could not find ACCESS_TOKEN_SECRET or REFRESH_TOKEN_SECRET env variable ' });
    return { error };
  }
  const accessPayload = {
    email: 'my_email',
  };
  const accessOptions: SignOptions = {
    issuer: 'http://localhost:8000',
    subject: 'userId',
    jwtid: uuidv4(),
    expiresIn: '1m',
    header: {
      typ: 'Bearer',
      alg: 'HS256',
    },
  };
  const refreshPayload = {
    email: 'my_email',
  };
  const refreshOptions: SignOptions = {
    issuer: 'http://localhost:8000',
    subject: 'userId',
    jwtid: uuidv4(),
    expiresIn: '5m',
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
