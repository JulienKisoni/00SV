import { generateToken } from '../utils/tokens';

type LoginPaylod = API_TYPES.Routes['body']['login'];
type LoginResponse = API_TYPES.Routes['business']['login'];

export const loginBusiness = async ({}: LoginPaylod): Promise<LoginResponse> => {
  // todo: Check if user exists in DB
  const { error, tokens } = await generateToken();
  if (error) {
    return { error };
  }
  return { tokens };
};
