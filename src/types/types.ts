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
  interface AddProductBody {
    name: string;
    quantity: number;
    description: string;
    minQuantity: number;
    active: boolean;
    unitPrice: number;
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
      getOne: {
        storeId: string;
      };
    };
    users: {
      getOne: {
        userId: string;
      };
    };
    products: {
      add: {
        body: AddProductBody;
        owner: string;
        storeId: string;
      };
      getByStoreId: {
        storeId: string;
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

  interface QueryParams {
    products: {
      deleteOne: {
        storeId: string;
        productId: string;
      };
    };
  }

  export interface Routes {
    body: Body;
    business: Business;
    params: QueryParams;
  }
}
