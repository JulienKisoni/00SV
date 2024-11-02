import request from 'supertest';
import should from 'should';
import { type Server } from 'http';

import { app } from '../../src/app';
import { startServer } from '../../src/utils/server';
import { clearDatabase, CONSTANTS, seedDatabase } from '../helpers';
import { IProductDocument, IReviewDocument, ITestUser } from '../../src/types/models';
import { login } from '../helpers/users';

const { invalidMongoId, nonExistingMongoId } = CONSTANTS;

const baseURL = '/products';
let testUser: ITestUser = {};
let product: IProductDocument | undefined;
let server: Server | undefined;

describe('PRODUCTS', () => {
  before(async () => {
    server = await startServer('8000', app);
    const res = await seedDatabase();
    product = res.product;
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

  describe('[GET] /products', () => {
    let url = baseURL;

    it('[401] Should fail: Unauthorized', async () => {
      request(app).get(url).expect(401);
    });

    it('[200] Should succeed: OK', async () => {
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const products = res.body.products as IProductDocument[];
      products.forEach((store) => {
        validateProduct(store);
      });
    });
  });

  describe('[GET] /products/:{productId}', () => {
    const invalidUrl = `${baseURL}/${invalidMongoId}`;

    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${product?._id}`;
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
      const url = `${baseURL}/${product?._id}`;
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const productResponse = res.body.product as IProductDocument;
      validateProduct(productResponse);
    });
  });

  describe('[GET] /products/:{productId}/reviews', () => {
    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${product?._id}/reviews`;
      request(app).get(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const url = `${baseURL}/${invalidMongoId}/reviews`;
      const token = testUser.token || '';
      request(app).get(url).set('Authorization', token).expect(400);
    });

    it('[404] Should fail: Not found', async () => {
      const url = `${baseURL}/${nonExistingMongoId}/reviews`;
      const token = testUser.token || '';
      request(app).get(url).set('Authorization', token).expect(404);
    });

    it('[200] Should succeed: OK', async () => {
      const url = `${baseURL}/${product?._id}/reviews`;
      const token = testUser.token || '';
      const res = await request(app).get(url).set('Authorization', token).expect(200);
      const reviews = res.body.reviews as IReviewDocument[];
      reviews.forEach((review) => {
        validateReview(review);
      });
    });
  });

  describe('[PATCH] /products/:{productId}', () => {
    const validBody = {
      name: 'The new name',
    };
    const invalidBody = {
      name: '',
    };

    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${product?._id}`;
      request(app).patch(url).expect(401);
    });

    it('[400] Should fail: Bad request', async () => {
      const url = `${baseURL}/${product?._id}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(invalidBody).expect(400);
    });

    it('[404] Should fail: Not found', async () => {
      const url = `${baseURL}/${nonExistingMongoId}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(validBody).expect(404);
    });

    it('[200] Should succeed: OK', async () => {
      const url = `${baseURL}/${product?._id}`;
      const token = testUser.token || '';
      request(app).patch(url).set('Authorization', token).send(validBody).expect(200);
    });
  });

  describe('[DELETE] /products/:{productId}', () => {
    it('[401] Should fail: Unauthorized', async () => {
      const url = `${baseURL}/${product?._id}`;
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
      const url = `${baseURL}/${product?._id}`;
      const token = testUser.token || '';
      request(app).delete(url).set('Authorization', token).expect(200);
    });
  });
});

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

export const validateReview = (review: IReviewDocument) => {
  should(review).have.property('_id');
  should(review).have.property('title');
  should(review).have.property('content');
  should(review).have.property('stars');
  should(review).have.property('productId');
  should(review).have.property('owner');
  should(review).have.property('createdAt');
  should(review).have.property('updatedAt');
};
