namespace API_TYPES {
  type LoginReq = {
    email: string;
    password: string;
  };
  type Tokens = {
    accessToken?: string;
    refreshToken?: string;
  };
  class GenericError extends Error {
    statusCode: number;
    publicMessage: string;
  }
  export interface TokenResponse {
    error?: GenericError;
    tokens?: Tokens;
  }

  interface Body {
    login: LoginReq;
    refreshToken: {
      refreshToken: string;
    };
  }

  interface Business {
    login: TokenResponse;
  }

  export interface DecodedToken {
    email: string;
    iat: number;
    exp: number;
    iss: string;
    sub: string;
    jti: string;
  }

  export interface Routes {
    body: Body;
    business: Business;
  }
}
