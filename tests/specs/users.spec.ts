import request from 'supertest';
import should from 'should';

import { app } from '../../src/app';
import { startServer } from '../../src/utils/server';
import { clearDatabase, CONSTANTS, seedDatabase } from '../helpers';
import { IOrderDocument, ITestUser, IUserDocument } from '../../src/types/models';
import { login } from '../helpers/users';

const { invalidMongoId, nonExistingMongoId } = CONSTANTS;

const baseURL = '/users';
let testUser: ITestUser = {};
let user: IUserDocument | undefined;

describe('USERS', () => {
  before(async () => {
    await startServer('8000', app);
    const res = await seedDatabase();
    user = res.user;
    const tokens = await login();
    if (tokens) {
      testUser.tokens = tokens;
      testUser.token = `Bearer ${tokens.accessToken}`;
    }
  });

  after(async () => {
    await clearDatabase();
    console.log('Database cleared');
  });

  describe('[GET] /users', () => {
    let url = baseURL;

    it('[401] Should fail: Unauthorized', async () => {
      request(app).get(url).expect(401);
    });

    it('[200] Should succeed: OK', async () => {
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const users = res.body.users as IUserDocument[];
      users.forEach((user) => {
        validateUser(user);
      });
    });
  });

  describe('[GET] /users/:{userId}', () => {
    const invalidUrl = `${baseURL}/${invalidMongoId}`;

    it('[401] Should fail: Unauthorized', async () => {
      request(app).get(invalidUrl).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const token = testUser.token || '';
      request(app).get(`${baseURL}/${invalidMongoId}`).set('Authorization', token).expect(400);
    });

    it('[404] Should fail: Not found', async () => {
      const token = testUser.token || '';
      request(app).get(`${baseURL}/${nonExistingMongoId}`).set('Authorization', token).expect(404);
    });

    it('[200] Should succeed: OK', async () => {
      const url = `${baseURL}/${user?._id}`;
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const userResponse = res.body.user as IUserDocument;
      validateUser(userResponse);
    });
  });

  describe('[GET] /users/me/orders', () => {
    const url = `${baseURL}/me/orders`;
    it('[401] Should fail: Unauthorized', async () => {
      request(app).get(url).expect(401);
    });

    it('[200] Should succeed: OK', async () => {
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const orders = res.body.orders as IOrderDocument[];
      orders.forEach((order) => {
        validateOrder(order);
      });
    });
  });

  describe('[POST] /users/signup', () => {
    const url = `${baseURL}/signup`;
    const validBody = {
      username: 'edouard',
      email: 'edouard@mail.com',
      password: 'edouard',
      role: 'user',
    };
    const invalidBody = { ...validBody };
    invalidBody.role = '';

    it('[401] Should fail: Unauthorized', async () => {
      request(app).post(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const token = testUser.token || '';
      request(app).post(url).set('Authorization', token).send(invalidBody).expect(400);
    });

    it('[201] Should succeed: OK', async () => {
      const token = testUser.token || '';
      const res = await request(app).post(url).set('Authorization', token).send(validBody).expect(201);
      should(res.body).have.property('userId');
    });
  });

  describe('[PATCH] /users/:{userId}', () => {
    const validBody = {
      profile: {
        role: 'admin',
      },
    };
    const invalidBody = { profile: { role: 'manager' } };

    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${user?._id}`;
      request(app).patch(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const url = `${baseURL}/${user?._id}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(invalidBody).expect(400);
    });

    it('[404] Should fail: Not found', async () => {
      const url = `${baseURL}/${nonExistingMongoId}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(invalidBody).expect(404);
    });

    it('[200] Should succeed: OK', async () => {
      const url = `${baseURL}/${user?._id}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(validBody).expect(200);
    });
  });

  describe('[DELETE] /users/:{userId}', () => {
    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${user?._id}`;
      request(app).delete(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const url = `${baseURL}/${invalidMongoId}`;
      const token = testUser.token || '';
      request(app).delete(url).set('Authorization', token).expect(400);
    });

    it('[400] Should fail: Not found', async () => {
      const url = `${baseURL}/${nonExistingMongoId}`;
      const token = testUser.token || '';
      request(app).delete(url).set('Authorization', token).expect(400);
    });

    it('[200] Should succeed: OK', async () => {
      const url = `${baseURL}/${user?._id}`;
      const token = testUser.token || '';
      request(app).delete(url).set('Authorization', token).expect(200);
    });
  });
});

export const validateUser = (user: IUserDocument) => {
  should(user).have.property('_id');
  should(user).have.property('username');
  should(user).have.property('email');
  should(user).have.property('storeIds');
  should(user).have.propertyByPath('profile', 'role');
  should(user).have.property('createdAt');
  should(user).have.property('updatedAt');
};

export const validateOrder = (order: IOrderDocument) => {
  should(order).have.property('_id');
  should(order).have.property('owner');
  should(order).have.property('totalPrice');
  should(order).have.property('orderNumber');
  should(order).have.property('status');
  should(order).have.property('items');
  should(order).have.property('createdAt');
  should(order).have.property('updatedAt');
};
