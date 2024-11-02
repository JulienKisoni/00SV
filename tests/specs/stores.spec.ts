import request from 'supertest';
import should from 'should';
import { type Server } from 'http';

import { app } from '../../src/app';
import { startServer } from '../../src/utils/server';
import { clearDatabase, CONSTANTS, seedDatabase } from '../helpers';
import { IProductDocument, IStoreDocument, ITestUser, IUserDocument } from '../../src/types/models';
import { login } from '../helpers/users';

const { invalidMongoId, nonExistingMongoId } = CONSTANTS;

const baseURL = '/stores';
let testUser: ITestUser = {};
let user: IUserDocument | undefined;
let store: IStoreDocument | undefined;
let server: Server | undefined;

describe('STORES', () => {
  before(async () => {
    server = await startServer('8000', app);
    const res = await seedDatabase();
    user = res.user;
    store = res.store;
    const tokens = await login();
    if (tokens) {
      testUser.tokens = tokens;
      testUser.token = `Bearer ${tokens.accessToken}`;
    }
  });

  after(async () => {
    await clearDatabase();
    if (server) {
      server.close();
    }
  });

  describe('[GET] /stores', () => {
    let url = baseURL;

    it('[401] Should fail: Unauthorized', async () => {
      request(app).get(url).expect(401);
    });

    it('[200] Should succeed: OK', async () => {
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const stores = res.body.stores as IStoreDocument[];
      stores.forEach((store) => {
        validateStore(store);
      });
    });
  });

  describe('[GET] /stores/:{storeId}', () => {
    const invalidUrl = `${baseURL}/${invalidMongoId}`;

    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${store?._id}`;
      request(app).get(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const token = testUser.token || '';
      request(app).get(invalidUrl).set('Authorization', token).expect(400);
    });

    it('[404] Should fail: Not found', async () => {
      const token = testUser.token || '';
      request(app).get(`${baseURL}/${nonExistingMongoId}`).set('Authorization', token).expect(404);
    });

    it('[200] Should succeed: OK', async () => {
      const url = `${baseURL}/${store?._id}`;
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const storeResponse = res.body.store as IStoreDocument;
      validateStore(storeResponse);
    });
  });

  describe('[GET] /stores/:{storeId}/products', () => {
    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${store?._id}/products`;
      request(app).get(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const url = `${baseURL}/${invalidMongoId}/products`;
      const token = testUser.token || '';
      request(app).get(url).set('Authorization', token).expect(400);
    });

    it('[404] Should fail: Not found', async () => {
      const url = `${baseURL}/${nonExistingMongoId}/products`;
      const token = testUser.token || '';
      request(app).get(url).set('Authorization', token).expect(404);
    });

    it('[200] Should succeed: OK', async () => {
      const url = `${baseURL}/${store?._id}/products`;
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const products = res.body.products as IProductDocument[];
      products.forEach((product) => {
        validateProduct(product);
      });
    });
  });

  describe('[POST] /stores', () => {
    const url = baseURL;
    const validBody = {
      name: 'Amazon',
      description: 'Amazon description',
      active: true,
    };
    const invalidBody = { ...validBody };
    invalidBody.description = '';

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
      should(res.body).have.property('storeId');
    });
  });
  describe('[POST] /stores/:{storeId}/products', () => {
    const validBody = {
      name: 'Playstation 5',
      quantity: 10,
      description: 'Playstation description',
      minQuantity: 2,
      active: true,
      unitPrice: 750,
    };
    const invalidBody = { ...validBody };
    invalidBody.description = '';

    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${store?._id}/products`;
      request(app).post(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const url = `${baseURL}/${store?._id}/products`;
      const token = testUser.token || '';
      request(app).post(url).set('Authorization', token).send(invalidBody).expect(400);
    });

    it('[404] Should fail: Not found', async () => {
      const url = `${baseURL}/${nonExistingMongoId}/products`;
      const token = testUser.token || '';
      request(app).post(url).set('Authorization', token).send(validBody).expect(404);
    });

    it('[201] Should succeed: OK', async () => {
      const url = `${baseURL}/${store?._id}/products`;
      const token = testUser.token || '';
      const res = await request(app).post(url).set('Authorization', token).send(validBody).expect(201);
      should(res.body).have.property('productId');
    });
  });

  describe('[PATCH] /stores/:{storeId}', () => {
    const validBody = {
      description: 'The new description',
    };
    const invalidBody = {
      description: '',
    };

    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${store?._id}`;
      request(app).patch(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const url = `${baseURL}/${store?._id}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(invalidBody).expect(400);
    });

    it('[404] Should fail: Not found', async () => {
      const url = `${baseURL}/${nonExistingMongoId}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(validBody).expect(404);
    });

    it('[200] Should succeed: OK', async () => {
      const url = `${baseURL}/${store?._id}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(validBody).expect(200);
    });
  });

  describe('[DELETE] /stores/:{storeId}', () => {
    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${store?._id}`;
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

export const validateStore = (store: IStoreDocument) => {
  should(store).have.property('_id');
  should(store).have.property('name');
  should(store).have.property('owner');
  should(store).have.property('products');
  should(store).have.property('description');
  should(store).have.property('active');
  should(store).have.property('createdAt');
  should(store).have.property('updatedAt');
};
export const validateProduct = (store: IProductDocument) => {
  should(store).have.property('_id');
  should(store).have.property('name');
  should(store).have.property('quantity');
  should(store).have.property('description');
  should(store).have.property('minQuantity');
  should(store).have.property('owner');
  should(store).have.property('active');
  should(store).have.property('unitPrice');
  should(store).have.property('reviews');
  should(store).have.property('createdAt');
  should(store).have.property('updatedAt');
};
