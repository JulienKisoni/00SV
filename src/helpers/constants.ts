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
];

export const regex = {
  mongoId: /^[0-9a-fA-F]{24}$/,
};
