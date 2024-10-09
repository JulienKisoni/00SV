namespace API_TYPES {
  type LoginReq = {
    email: string;
    password: string;
  };
  type Tokens = {
    accessToken: string;
    refreshToken: string;
  };
  class GenericError extends Error {
    statusCode: number;
    publicMessage: string;
  }
  interface TokenResponse {
    error?: GenericError;
    tokens?: Tokens;
  }

  interface Body {
    login: LoginReq;
  }

  interface Business {
    login: TokenResponse;
  }

  export interface Routes {
    body: Body;
    business: Business;
  }
}
