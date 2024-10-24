export const nonSecureRoutes: { path: string; method: string }[] = [
  {
    path: '/auth/login',
    method: 'POST',
  },
  {
    path: '/auth/refreshToken',
    method: 'POST',
  },
  {
    path: '/users/signup',
    method: 'POST',
  },
  {
    path: '/v1/api-docs',
    method: 'GET',
  },
  {
    path: '/favicon.ico',
    method: 'GET',
  },
];

export const regex = {
  mongoId: /^[0-9a-fA-F]{24}$/,
};
