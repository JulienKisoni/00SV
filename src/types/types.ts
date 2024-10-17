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

  interface AddStore {
    userId: string;
    active: boolean;
    name: string;
    description: string;
  }
  interface DeleteStore {
    storeId: string;
  }

  interface Body {
    login: LoginReq;
    refreshToken: {
      refreshToken: string;
    };
  }

  interface Business {
    auth: {
      login: TokenResponse;
    };
    stores: {
      editStore: {
        active?: boolean;
        name?: string;
        description?: string;
      };
      addStore: AddStore;
      deleteStore: DeleteStore;
    };
    users: {
      getOne: {
        userId: string;
      };
    };
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
